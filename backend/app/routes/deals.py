"""
JACRAL – Public deals route.

GET /api/v1/deals/active   PUBLIC – active deal cards for the Shop page, in order.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.deals import Deal
from app.schemas.deals import DealPublicOut

router = APIRouter(tags=["Deals"])


@router.get(
    "/active",
    response_model=list[DealPublicOut],
    summary="List active deal cards, in display order",
)
def list_active_deals(db: Session = Depends(get_db)):
    return (
        db.query(Deal)
        .filter(Deal.is_active.is_(True))
        .order_by(Deal.display_order.asc(), Deal.created_at.desc())
        .all()
    )