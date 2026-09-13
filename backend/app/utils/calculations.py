"""
JACRAL – Server-side price and discount calculations.
Frontend prices are NEVER trusted.
"""
from decimal import ROUND_HALF_UP, Decimal

from app.models.coupon import Coupon


def calculate_subtotal(unit_price: Decimal, quantity: int) -> Decimal:
    """Return unit_price * quantity, rounded to 2 decimal places."""
    return (unit_price * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def apply_coupon(
    coupon: Coupon,
    order_total: Decimal,
) -> Decimal:
    """
    Calculate discount amount from a Coupon applied to an order total.
    Returns the discount value (not the final price).
    """
    if coupon.discount_type == "percentage":
        discount = (order_total * coupon.discount_value / Decimal("100")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        if coupon.maximum_discount is not None:
            discount = min(discount, coupon.maximum_discount)
    else:
        discount = coupon.discount_value

    # Never discount more than the total
    return min(discount, order_total)
