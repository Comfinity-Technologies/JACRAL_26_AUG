"""
JACRAL – Coupon routes.

POST /api/v1/coupons/validate   PUBLIC
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.coupon import CouponValidateRequest, CouponValidateResponse
from app.services import coupon_service

router = APIRouter(tags=["Coupons"])


@router.post(
    "/validate",
    response_model=CouponValidateResponse,
    summary="Validate a coupon code against an order amount",
)
def validate_coupon(data: CouponValidateRequest, db: Session = Depends(get_db)):
    result = coupon_service.validate_coupon(db, data.code, data.order_amount)
    return CouponValidateResponse(**result)
