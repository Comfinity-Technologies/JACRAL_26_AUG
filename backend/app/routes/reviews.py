"""
JACRAL – Public Customer Reviews Route.

GET /api/v1/reviews   Returns only published + active reviews, ordered by display_order.
"""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.review import CustomerReview
from app.schemas.review import ReviewPublicOut

router = APIRouter(tags=["Reviews (Public)"])


@router.get("", response_model=List[ReviewPublicOut], summary="Get published customer reviews")
def get_published_reviews(db: Session = Depends(get_db)):
    """
    Returns all published and active customer reviews for the homepage.
    Only visible reviews are returned — no admin-only or draft data exposed.
    """
    reviews = (
        db.query(CustomerReview)
        .filter(
            CustomerReview.is_published.is_(True),
            CustomerReview.is_active.is_(True),
        )
        .order_by(CustomerReview.display_order.asc(), CustomerReview.created_at.desc())
        .all()
    )
    return reviews
