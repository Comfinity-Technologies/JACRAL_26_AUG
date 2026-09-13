"""
JACRAL – Admin: Analytics & Dashboard.

GET /api/v1/admin/analytics/dashboard   MANAGER+
GET /api/v1/admin/analytics/utm         MANAGER+
GET /api/v1/admin/analytics/traffic     MANAGER+
GET /api/v1/admin/analytics/top-products MANAGER+
GET /api/v1/admin/audit-logs            ADMIN
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, cast, String
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audit_log import AuditLog
from app.models.order import Order
from app.models.user import User
from app.schemas.analytics import DashboardOverview, TopProduct, TrafficOverview
from app.security.permissions import require_admin, require_super_admin
from app.services import analytics_service
from app.utils.pagination import PaginatedResponse, PaginationParams

router = APIRouter(tags=["Admin – Analytics"])


@router.get("/dashboard", response_model=DashboardOverview, summary="Admin dashboard overview")
def dashboard(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return analytics_service.get_dashboard_overview(db)


@router.get("/top-products", response_model=list[TopProduct], summary="Top selling products")
def top_products(limit: int = Query(default=10, ge=1, le=50), db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return analytics_service.get_top_products(db, limit=limit)


@router.get("/traffic", response_model=TrafficOverview, summary="UTM traffic overview")
def traffic(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return analytics_service.get_traffic_overview(db)


@router.get("/utm", response_model=TrafficOverview, summary="UTM analytics (alias)")
def utm(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return analytics_service.get_traffic_overview(db)


@router.get("/revenue-chart", summary="Revenue over time (last 30 days, daily)")
def revenue_chart(
    days: int = Query(default=30, ge=7, le=365),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Returns daily revenue totals for the chart."""
    from datetime import datetime, timedelta, timezone
    from sqlalchemy import case
    from decimal import Decimal

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    rows = (
        db.query(
            func.date(Order.created_at).label("day"),
            func.coalesce(
                func.sum(case((Order.payment_status == "paid", Order.total_amount), else_=0)),
                0,
            ).label("revenue"),
            func.count(Order.id).label("orders"),
        )
        .filter(Order.created_at >= cutoff)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at).asc())
        .all()
    )
    return [
        {
            "date": str(r.day),
            "revenue": float(r.revenue or 0),
            "orders": int(r.orders or 0),
        }
        for r in rows
    ]


@router.get("/user-growth", summary="User registrations over time (last 30 days, daily)")
def user_growth(
    days: int = Query(default=30, ge=7, le=365),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Returns daily new-user registration counts for the chart."""
    from datetime import datetime, timedelta, timezone

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    rows = (
        db.query(
            func.date(User.created_at).label("day"),
            func.count(User.id).label("registrations"),
        )
        .filter(User.created_at >= cutoff)
        .group_by(func.date(User.created_at))
        .order_by(func.date(User.created_at).asc())
        .all()
    )
    return [
        {
            "date": str(r.day),
            "registrations": int(r.registrations or 0),
        }
        for r in rows
    ]


@router.get("/audit-logs", summary="Audit logs (admin only)")
def audit_logs(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    action: str = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    pagination = PaginationParams(page=page, limit=limit)
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    total = q.count()
    items = q.order_by(AuditLog.created_at.desc()).offset(pagination.offset).limit(pagination.limit).all()

    def _serialize(log):
        return {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }

    return PaginatedResponse.build(items=[_serialize(l) for l in items], total=total, pagination=pagination)
