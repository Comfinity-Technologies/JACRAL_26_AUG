"""
JACRAL – Order routes (customer-facing).

POST /api/v1/orders         CUSTOMER (create order)
GET  /api/v1/orders         CUSTOMER (own orders)
GET  /api/v1/orders/{id}    CUSTOMER (own order detail)
POST /api/v1/orders/estimate CUSTOMER (pre-checkout price breakdown)
"""
import asyncio
import logging
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.coupon import Coupon
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import (
    OrderCreate,
    OrderEstimateOut,
    OrderEstimateRequest,
    OrderOut,
)
from app.security.permissions import require_customer
from app.services import coupon_service, email_service
from app.utils.calculations import apply_coupon, calculate_subtotal
from app.utils.pagination import PaginatedResponse, PaginationParams

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Orders"])

# Flat-rate shipping fallback when Shiprocket is not configured or lookup fails
_FLAT_RATE_SHIPPING = Decimal("0.00")
# Pickup pincode for Shiprocket rate requests (set in .env as PICKUP_PINCODE or use default)
_PICKUP_PINCODE = "678001"


def _compute_shipping(delivery_pincode: str | None) -> Decimal:
    """
    Attempt to get Shiprocket rate. Falls back to flat rate on any failure.
    This is called synchronously inside the order route via asyncio.
    """
    if not delivery_pincode or not settings.shiprocket_configured:
        return _FLAT_RATE_SHIPPING

    try:
        from app.services.shipping_service import get_serviceability_and_rate
        loop = asyncio.new_event_loop()
        result = loop.run_until_complete(
            get_serviceability_and_rate(
                pickup_pincode=_PICKUP_PINCODE,
                delivery_pincode=delivery_pincode,
            )
        )
        loop.close()
        if result and result.get("rate"):
            return Decimal(str(result["rate"])).quantize(Decimal("0.01"))
    except Exception as exc:
        logger.warning("Shipping rate lookup failed: %s – using flat rate", exc)

    return _FLAT_RATE_SHIPPING


@router.post(
    "/estimate",
    response_model=OrderEstimateOut,
    summary="Get pre-checkout price breakdown (subtotal, shipping, tax, discount, total)",
)
def estimate_order(
    data: OrderEstimateRequest,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    """
    Returns a full price breakdown for the checkout summary sidebar
    without committing an order. Safe to call on every cart/checkout update.
    """
    # Validate products and compute subtotal
    order_subtotal = Decimal("0.00")
    for req in data.items:
        product = db.query(Product).filter(
            Product.id == req.product_id, Product.is_active.is_(True)
        ).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {req.product_id} not found.")
        order_subtotal += calculate_subtotal(product.price, req.quantity)

    # Shipping
    shipping_charge = _compute_shipping(data.delivery_pincode)
    shipping_available = shipping_charge > Decimal("0.00") or data.delivery_pincode is None

    # Tax = 5% of subtotal (not on shipping per standard practice)
    tax_amount = (order_subtotal * Decimal(str(settings.GST_RATE))).quantize(Decimal("0.01"))

    # Coupon discount
    discount = Decimal("0.00")
    coupon_applied = False
    coupon_type = None
    coupon_val = None
    if data.coupon_code:
        result = coupon_service.validate_coupon(db, data.coupon_code, order_subtotal)
        if result.get("valid"):
            discount = result["discount_amount"]
            coupon_applied = True
            coupon_type = result.get("discount_type")
            coupon_val = result.get("discount_value")

    total = order_subtotal + shipping_charge + tax_amount - discount
    total = max(Decimal("0.00"), total)

    return OrderEstimateOut(
        subtotal=order_subtotal,
        shipping_charge=shipping_charge,
        tax_amount=tax_amount,
        discount_amount=discount,
        total_amount=total,
        shipping_available=shipping_available,
        coupon_applied=coupon_applied,
        coupon_discount_type=coupon_type,
        coupon_discount_value=coupon_val,
    )


@router.post(
    "/",
    response_model=OrderOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order (server-side pricing, tax, shipping)",
)
def create_order(
    data: OrderCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    # ── Terms of Service check ──────────────────────────────────────────────
    if not data.accepted_terms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must accept the Terms of Service and Return & Refund Policy to place an order.",
        )

    if not data.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must have at least one item.")

    # ── Validate all products ────────────────────────────────────────────────
    validated = []
    for req in data.items:
        product = db.query(Product).filter(
            Product.id == req.product_id, Product.is_active.is_(True)
        ).with_for_update().first()

        if not product:
            raise HTTPException(status_code=404, detail=f"Product {req.product_id} not found or inactive.")

        if product.stock < req.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock}.",
            )
        validated.append((product, req.quantity))

    # ── Subtotal (server-side) ───────────────────────────────────────────────
    order_subtotal = Decimal("0.00")
    for product, qty in validated:
        order_subtotal += calculate_subtotal(product.price, qty)

    # ── Shipping charge ──────────────────────────────────────────────────────
    shipping_charge = _compute_shipping(data.delivery_pincode)

    # ── Tax (5% of subtotal, not on shipping) ────────────────────────────────
    tax_amount = (order_subtotal * Decimal(str(settings.GST_RATE))).quantize(Decimal("0.01"))

    # ── Coupon discount ──────────────────────────────────────────────────────
    discount = Decimal("0.00")
    coupon: Coupon | None = None
    applied_code: str | None = None

    if data.coupon_code:
        result = coupon_service.validate_coupon(db, data.coupon_code, order_subtotal)
        if not result["valid"]:
            raise HTTPException(status_code=400, detail=result["message"])
        coupon = coupon_service.get_valid_coupon(db, data.coupon_code)
        discount = result["discount_amount"]
        applied_code = coupon.code if coupon else None

    # ── Grand total ──────────────────────────────────────────────────────────
    # Order: subtotal + shipping + tax − coupon_discount
    final_total = max(Decimal("0.00"), order_subtotal + shipping_charge + tax_amount - discount)

    # ── Create order in transaction ──────────────────────────────────────────
    now_utc = datetime.now(timezone.utc)
    order = Order(
        user_id=current_user.id,
        status="pending",
        payment_status="pending",
        subtotal=order_subtotal,
        tax_amount=tax_amount,
        shipping_charge=shipping_charge,
        discount_amount=discount,
        total_amount=final_total,
        coupon_id=coupon.id if coupon else None,
        coupon_code=applied_code,
        accepted_terms=True,
        accepted_terms_at=now_utc,
        shipping_name=data.shipping_name,
        shipping_email=data.shipping_email,
        shipping_phone=data.shipping_phone,
        shipping_address=data.shipping_address,
        notes=data.notes,
    )
    db.add(order)
    db.flush()

    for product, qty in validated:
        subtotal = calculate_subtotal(product.price, qty)
        item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=product.price,
            subtotal=subtotal,
        )
        db.add(item)
        product.stock -= qty  # Reduce stock inside transaction

    if coupon:
        coupon_service.increment_coupon_usage(db, coupon)

    db.commit()
    db.refresh(order)

    # ── Non-blocking email ───────────────────────────────────────────────────
    email_service.send_order_confirmation(
        background_tasks=background_tasks,
        to=current_user.email,
        order_id=order.id,
        total=str(final_total),
        customer_name=current_user.name,
    )

    return order


@router.get("", summary="List current user's orders")
def list_my_orders(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    pagination = PaginationParams(page=page, limit=limit)
    q = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc())
    total = q.count()
    items = q.offset(pagination.offset).limit(pagination.limit).all()

    return PaginatedResponse.build(
        items=[OrderOut.model_validate(o) for o in items],
        total=total,
        pagination=pagination,
    )


@router.get("/{order_id}", response_model=OrderOut, summary="Get a specific order (own only)")
def get_order(
    order_id: int,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(
        Order.id == order_id, Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    return order