"""
JACRAL – Admin: Order management.

GET   /api/v1/admin/orders              STAFF+
GET   /api/v1/admin/orders/{id}         STAFF+
PATCH /api/v1/admin/orders/{id}/status  STAFF+
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from datetime import timedelta
from sqlalchemy import func
from app.database import get_db
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderOut, OrderStatusUpdate
from app.security.permissions import require_employee
from app.services import audit_service, email_service, shipping_service
from app.utils.pagination import PaginatedResponse, PaginationParams

router = APIRouter(tags=["Admin – Orders"])


@router.get("", summary="List all orders (admin)")
def list_orders_admin(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    status_filter: str = Query(default=None, alias="status"),
    payment_status: str = Query(default=None),
    db: Session = Depends(get_db),
    _staff: User = Depends(require_employee),
):
    pagination = PaginationParams(page=page, limit=limit)
    q = db.query(Order)
    if status_filter:
        q = q.filter(Order.status == status_filter)
    if payment_status:
        q = q.filter(Order.payment_status == payment_status)
    total = q.count()
    items = q.order_by(Order.created_at.desc()).offset(pagination.offset).limit(pagination.limit).all()
    return PaginatedResponse.build(items=[OrderOut.model_validate(o) for o in items], total=total, pagination=pagination)


@router.get("/{order_id}", response_model=OrderOut, summary="Get any order (admin)")
def get_order_admin(order_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_employee)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut, summary="Update order status")
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    staff: User = Depends(require_employee),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    old_status = order.status
    
    # Enforce transitions
    VALID_TRANSITIONS = {
        "pending": ["confirmed", "cancelled"],
        "confirmed": ["processing", "cancelled"],
        "processing": ["packed", "cancelled"],
        "packed": ["shipped", "cancelled"],
        "shipped": ["out_for_delivery", "cancelled"],
        "out_for_delivery": ["delivered", "cancelled"],
        "delivered": [], # Terminal state
        "cancelled": [], # Terminal state
    }
    
    if data.status not in VALID_TRANSITIONS.get(old_status, []):
        raise HTTPException(status_code=400, detail=f"Invalid transition from {old_status} to {data.status}")

    order.status = data.status
    
    # Restock inventory on cancellation
    if data.status == "cancelled" and old_status != "cancelled":
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if product:
                product.stock += item.quantity

    db.commit()
    db.refresh(order)

    audit_service.log_action(
        db, "ORDER_STATUS_UPDATED", staff.id, "order", str(order_id),
        {"old_status": old_status, "new_status": data.status}
    )
    db.commit()

    # Send email notifications for key status changes
    if data.status == "confirmed" and old_status != "confirmed":
        email_service.send_order_confirmed(background_tasks, order.shipping_email, order.id)
        background_tasks.add_task(shipping_service.create_shipment_background, order.id)
    elif data.status == "shipped" and old_status != "shipped":
        email_service.send_order_shipped(background_tasks, order.shipping_email, order.id, order.shipment_id)
    elif data.status == "delivered" and old_status != "delivered":
        email_service.send_order_delivered(background_tasks, order.shipping_email, order.id)
    elif data.status == "cancelled" and old_status != "cancelled":
        email_service.send_order_cancelled(background_tasks, order.shipping_email, order.id)

    return order


@router.post("/expire-abandoned", summary="Cancel pending orders older than 24h")
def expire_abandoned_orders(
    db: Session = Depends(get_db),
    staff: User = Depends(require_employee),
):
    # Find orders pending for more than 24 hours
    cutoff = func.now() - timedelta(hours=24)
    orders = db.query(Order).filter(
        Order.status == "pending",
        Order.created_at < cutoff
    ).with_for_update().all()
    
    cancelled_count = 0
    for order in orders:
        order.status = "cancelled"
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if product:
                product.stock += item.quantity
                
        audit_service.log_action(
            db, "ORDER_EXPIRED", staff.id, "order", str(order.id),
            {"old_status": "pending", "new_status": "cancelled", "reason": "abandoned"}
        )
        cancelled_count += 1
        
    db.commit()
    return {"message": f"Expired {cancelled_count} abandoned orders"}
