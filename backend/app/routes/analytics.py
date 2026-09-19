"""
JACRAL – Public analytics routes.

GET /api/v1/analytics/top-customers   Returns top 25 customers by total items ordered
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.user import User

router = APIRouter(tags=["Analytics"])


@router.get("/", summary="Analytics root (stub)")
def get_analytics():
    return []


@router.get(
    "/top-customers",
    summary="Top customers by total items ordered (for Jacral Champions leaderboard)",
)
def get_top_customers(
    limit: int = Query(default=25, ge=1, le=25),
    db: Session = Depends(get_db),
):
    """
    Returns up to 25 customers ranked by total number of items ordered
    (summed across all their confirmed orders).

    When zero real orders exist, returns an empty list [] — the frontend
    will display a friendly empty-state card in that case.

    Ordering: descending by total_items_ordered.
    Only includes orders with status != 'cancelled'.
    """
    rows = (
        db.query(
            User.id.label("user_id"),
            User.name.label("name"),
            func.count(Order.id.distinct()).label("total_orders"),
            func.coalesce(func.sum(OrderItem.quantity), 0).label("total_items_ordered"),
            func.coalesce(func.sum(OrderItem.subtotal), 0).label("total_spent"),
        )
        .join(Order, Order.user_id == User.id)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .filter(Order.status != "cancelled")
        .group_by(User.id, User.name)
        .order_by(func.coalesce(func.sum(OrderItem.quantity), 0).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "user_id": r.user_id,
            "name": r.name,
            "total_orders": int(r.total_orders),
            "total_items_ordered": int(r.total_items_ordered),
            "total_spent": f"{float(r.total_spent):,.0f}",
        }
        for r in rows
    ]
