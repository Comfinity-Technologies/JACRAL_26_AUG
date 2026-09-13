"""
JACRAL – Analytics / UTM routes.

POST /api/v1/analytics/visit   PUBLIC
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.utm_visit import UtmVisit
from app.schemas.analytics import UtmVisitRequest, TopCustomer
from app.services import analytics_service

router = APIRouter(tags=["Analytics"])


@router.post("/visit", status_code=201, summary="Record an anonymous UTM visit")
def record_visit(data: UtmVisitRequest, db: Session = Depends(get_db)):
    visit = UtmVisit(**data.model_dump())
    db.add(visit)
    db.commit()
    return {"success": True, "message": "Visit recorded."}


@router.get("/top-customers", response_model=list[TopCustomer], summary="Get top customers for leaderboard")
def top_customers(db: Session = Depends(get_db)):
    return analytics_service.get_top_customers(db, limit=10)


@router.get("/summary", summary="Public analytics summary for admin analytics page")
def analytics_summary(db: Session = Depends(get_db)):
    """Returns the same data as the admin dashboard but without auth guard, for use by admin analytics page."""
    overview = analytics_service.get_dashboard_overview(db)
    top_products = analytics_service.get_top_products(db, limit=10)
    return {
        "total_revenue": float(overview.total_revenue),
        "total_orders": overview.total_orders,
        "total_customers": overview.total_customers,
        "pending_orders": overview.pending_orders,
        "processing_orders": overview.confirmed_orders,
        "shipped_orders": 0,
        "delivered_orders": overview.completed_orders,
        "top_products": [
            {
                "id": p.product_id,
                "name": p.product_name,
                "total_sold": p.total_sold,
                "revenue": float(p.revenue),
            }
            for p in top_products
        ],
    }
