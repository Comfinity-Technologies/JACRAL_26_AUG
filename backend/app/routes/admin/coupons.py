"""
JACRAL – Admin: Coupon management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.coupon import Coupon
from app.models.user import User
from app.schemas.coupon import CouponCreate, CouponOut, CouponUpdate
from app.security.permissions import require_admin
from app.services import audit_service

router = APIRouter(tags=["Admin – Coupons"])


@router.get("", response_model=list[CouponOut], summary="List all coupons")
def list_coupons(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()


@router.post("", response_model=CouponOut, status_code=201, summary="Create coupon")
def create_coupon(data: CouponCreate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    if db.query(Coupon).filter(Coupon.code == data.code.upper()).first():
        raise HTTPException(status_code=409, detail="Coupon code already exists.")
    coupon = Coupon(**{**data.model_dump(), "code": data.code.upper().strip()})
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    audit_service.log_action(db, "COUPON_CREATED", admin.id, "coupon", str(coupon.id), {"code": coupon.code})
    db.commit()
    return coupon


@router.patch("/{coupon_id}", response_model=CouponOut, summary="Update coupon")
def update_coupon(coupon_id: int, data: CouponUpdate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found.")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(coupon, field, value)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}", summary="Delete coupon")
def delete_coupon(coupon_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found.")
    db.delete(coupon)
    db.commit()
    return {"success": True, "message": "Coupon deleted."}
