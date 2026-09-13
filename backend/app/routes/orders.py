"""
JACRAL – Order routes (customer-facing).

POST /api/v1/orders         CUSTOMER (create order)
GET  /api/v1/orders         CUSTOMER (own orders)
GET  /api/v1/orders/{id}    CUSTOMER (own order detail)
"""
from decimal import Decimal

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.coupon import Coupon
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut
from app.security.permissions import require_customer
from app.services import coupon_service, email_service
from app.utils.calculations import apply_coupon, calculate_subtotal
from app.utils.pagination import PaginatedResponse, PaginationParams

router = APIRouter(tags=["Orders"])


@router.post(
    "/",
    response_model=OrderOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order (server-side pricing)",
)
def create_order(
    data: OrderCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    if not data.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must have at least one item.")

    # -- Validate all products first --
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

    # -- Calculate subtotals server-side --
    order_total = Decimal("0.00")
    for product, qty in validated:
        order_total += calculate_subtotal(product.price, qty)

    # -- Coupon --
    discount = Decimal("0.00")
    coupon: Coupon | None = None
    applied_code: str | None = None

    if data.coupon_code:
        result = coupon_service.validate_coupon(db, data.coupon_code, order_total)
        if not result["valid"]:
            raise HTTPException(status_code=400, detail=result["message"])
        coupon = coupon_service.get_valid_coupon(db, data.coupon_code)
        discount = result["discount_amount"]
        applied_code = coupon.code if coupon else None

    final_total = order_total - discount

    # -- Create order in transaction --
    order = Order(
        user_id=current_user.id,
        status="pending",
        payment_status="pending",
        total_amount=final_total,
        discount_amount=discount,
        coupon_id=coupon.id if coupon else None,
        coupon_code=applied_code,
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

    # Non-blocking email
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