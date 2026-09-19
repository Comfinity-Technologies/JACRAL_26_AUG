"""
JACRAL – Coupon routes.

GET  /api/v1/coupons/active     PUBLIC – returns coupons marked Featured in admin
POST /api/v1/coupons/validate   PUBLIC
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.coupon import (
    CouponPublicOut,
    CouponValidateRequest,
    CouponValidateResponse,
)
from app.services import coupon_service

router = APIRouter(tags=["Coupons"])


@router.get(
    "/active",
    response_model=list[CouponPublicOut],
    summary="List active, admin-featured coupons for the homepage banner",
)
def list_active_coupons(db: Session = Depends(get_db)):
    return coupon_service.get_featured_public_coupons(db)


@router.post(
    "/validate",
    response_model=CouponValidateResponse,
    summary="Validate a coupon code against an order amount",
)
def validate_coupon(data: CouponValidateRequest, db: Session = Depends(get_db)):
    result = coupon_service.validate_coupon(db, data.code, data.order_amount)
    return CouponValidateResponse(**result)