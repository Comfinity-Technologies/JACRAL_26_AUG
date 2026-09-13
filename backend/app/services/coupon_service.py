"""
JACRAL – Coupon service.
Server-side coupon validation and discount calculation.
"""
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.models.coupon import Coupon
from app.utils.calculations import apply_coupon


def get_valid_coupon(db: Session, code: str) -> Optional[Coupon]:
    """
    Fetch a coupon by code if it is active and within its validity period.
    Returns None if invalid.
    """
    now = datetime.now(timezone.utc)
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

    if coupon.starts_at and coupon.starts_at > now:
        return None

    if coupon.expires_at and coupon.expires_at < now:
        return None

    if coupon.usage_limit is not None and coupon.used_count >= coupon.usage_limit:
        return None

    return coupon


def validate_coupon(
    db: Session,
    code: str,
    order_amount: Decimal,
) -> dict:
    """
    Validate a coupon code against an order amount.
    Returns a dict with valid flag, discount amount, and message.
    """
    coupon = get_valid_coupon(db, code)

    if coupon is None:
        return {
            "valid": False,
            "code": code,
            "message": "Coupon code is invalid or has expired.",
        }

    if order_amount < coupon.minimum_order_amount:
        return {
            "valid": False,
            "code": code,
            "message": f"Minimum order amount ₹{coupon.minimum_order_amount} required.",
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
    """Atomically increment the coupon used_count within a transaction."""
    locked_coupon = db.query(Coupon).filter(Coupon.id == coupon.id).with_for_update().first()
    if locked_coupon:
        locked_coupon.used_count += 1
        db.flush()
