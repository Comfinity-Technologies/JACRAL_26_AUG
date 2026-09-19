"""
JACRAL – Coupon service.
Server-side coupon validation and discount calculation.
"""
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.coupon import Coupon
from app.utils.calculations import apply_coupon


def get_valid_coupon(db: Session, code: str) -> Optional[Coupon]:
    now = datetime.utcnow()
    coupon = (
        db.query(Coupon)
        .filter(
            Coupon.code == code.upper().strip(),
            Coupon.is_active.is_(True),
        )
        .first()
    )

    if coupon is None:
        return None
    if coupon.valid_from and coupon.valid_from > now:
        return None
    if coupon.valid_until and coupon.valid_until < now:
        return None
    if coupon.usage_limit is not None and coupon.used_count >= coupon.usage_limit:
        return None

    return coupon


def get_featured_public_coupons(db: Session) -> list[Coupon]:
    """
    Fetch coupons that are active, marked is_featured (i.e. explicitly chosen
    in the admin panel to appear in the homepage banner), and within their
    validity window.
    """
    now = datetime.utcnow()
    return (
        db.query(Coupon)
        .filter(Coupon.is_active.is_(True))
        .filter(Coupon.is_featured.is_(True))
        .filter((Coupon.valid_from.is_(None)) | (Coupon.valid_from <= now))
        .filter((Coupon.valid_until.is_(None)) | (Coupon.valid_until >= now))
        .filter(
            (Coupon.usage_limit.is_(None)) | (Coupon.used_count < Coupon.usage_limit)
        )
        .order_by(Coupon.updated_at.desc())
        .all()
    )


def validate_coupon(db: Session, code: str, order_amount: float) -> dict:
    coupon = get_valid_coupon(db, code)

    if coupon is None:
        return {"valid": False, "code": code, "message": "Coupon code is invalid or has expired."}

    if order_amount < coupon.min_purchase_amount:
        return {
            "valid": False,
            "code": code,
            "message": f"Minimum order amount ₹{coupon.min_purchase_amount} required.",
        }

    discount = apply_coupon(coupon, order_amount)

    return {
        "valid": True,
        "code": coupon.code,
        "discount_type": coupon.discount_type,
        "discount_value": coupon.discount_value,
        "discount_amount": discount,
        "message": f"Coupon applied – you save ₹{discount}.",
    }


def increment_coupon_usage(db: Session, coupon: Coupon) -> None:
    locked_coupon = db.query(Coupon).filter(Coupon.id == coupon.id).with_for_update().first()
    if locked_coupon:
        locked_coupon.used_count += 1
        db.flush()