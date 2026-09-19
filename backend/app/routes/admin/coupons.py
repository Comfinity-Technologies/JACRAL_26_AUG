"""
JACRAL – Admin Coupon routes.

GET    /api/v1/admin/coupons/              List all coupons
POST   /api/v1/admin/coupons/             Create a coupon
PUT    /api/v1/admin/coupons/{id}         Update a coupon
DELETE /api/v1/admin/coupons/{id}         Delete a coupon
PATCH  /api/v1/admin/coupons/{id}/feature Toggle/set featured status (any number of coupons can be featured)
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.coupon import Coupon
from app.models.user import User
from app.security.permissions import require_admin

router = APIRouter(tags=["Admin Coupons"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class CouponCreate(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: str = "percentage"   # "percentage" | "fixed"
    discount_value: float
    min_purchase_amount: float = 0.0
    max_discount_amount: Optional[float] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True
    usage_limit: Optional[int] = None
    is_featured: bool = False


class CouponUpdate(BaseModel):
    code: Optional[str] = None
    description: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    min_purchase_amount: Optional[float] = None
    max_discount_amount: Optional[float] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: Optional[bool] = None
    usage_limit: Optional[int] = None
    is_featured: Optional[bool] = None


class CouponOut(BaseModel):
    id: int
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: float
    min_purchase_amount: float
    max_discount_amount: Optional[float] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool
    usage_limit: Optional[int] = None
    used_count: int
    is_featured: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=list[CouponOut], summary="List all coupons")
def admin_get_coupons(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()


@router.post(
    "",
    response_model=CouponOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a coupon",
)
def admin_create_coupon(
    data: CouponCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    existing = db.query(Coupon).filter(Coupon.code == data.code.upper().strip()).first()
    if existing:
        raise HTTPException(status_code=409, detail="A coupon with this code already exists.")

    # Any number of coupons can be featured at once for the homepage banner.
    coupon = Coupon(
        code=data.code.upper().strip(),
        description=data.description,
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        min_purchase_amount=data.min_purchase_amount,
        max_discount_amount=data.max_discount_amount,
        valid_from=data.valid_from or datetime.utcnow(),
        valid_until=data.valid_until,
        is_active=data.is_active,
        usage_limit=data.usage_limit,
        is_featured=data.is_featured,
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.put("/{coupon_id}", response_model=CouponOut, summary="Update a coupon")
def admin_update_coupon(
    coupon_id: int,
    data: CouponUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found.")

    updates = data.model_dump(exclude_unset=True)

    # Any number of coupons can be featured at once for the homepage banner.
    for field, value in updates.items():
        if field == "code" and value is not None:
            value = value.upper().strip()
        setattr(coupon, field, value)

    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}", summary="Delete a coupon")
def admin_delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found.")

    db.delete(coupon)
    db.commit()
    return {"success": True, "message": "Coupon deleted."}


@router.patch(
    "/{coupon_id}/feature",
    response_model=CouponOut,
    summary="Toggle coupon as featured on the homepage promo ribbon",
)
def admin_feature_coupon(
    coupon_id: int,
    is_featured: Optional[bool] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Toggles (or explicitly sets, via the ?is_featured= query param) whether
    this coupon appears in the homepage promo ribbon. Any number of coupons
    can be featured at the same time.
    """
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found.")

    coupon.is_featured = (not coupon.is_featured) if is_featured is None else is_featured

    db.commit()
    db.refresh(coupon)
    return coupon