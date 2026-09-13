import pytest
from decimal import Decimal
from app.utils.calculations import calculate_subtotal, apply_coupon
from app.models.coupon import Coupon

def test_calculate_subtotal():
    assert calculate_subtotal(Decimal("100.00"), 2) == Decimal("200.00")
    assert calculate_subtotal(Decimal("50.50"), 3) == Decimal("151.50")
    assert calculate_subtotal(Decimal("0.00"), 5) == Decimal("0.00")

def test_apply_coupon_fixed():
    coupon = Coupon(discount_type="fixed", discount_value=Decimal("50.00"), maximum_discount=Decimal("100.00"))
    assert apply_coupon(coupon, Decimal("200.00")) == Decimal("50.00")
    # Discount shouldn't exceed order amount
    assert apply_coupon(coupon, Decimal("30.00")) == Decimal("30.00")

def test_apply_coupon_percentage():
    coupon = Coupon(discount_type="percentage", discount_value=Decimal("10.00"), maximum_discount=Decimal("50.00"))
    assert apply_coupon(coupon, Decimal("100.00")) == Decimal("10.00")
    assert apply_coupon(coupon, Decimal("1000.00")) == Decimal("50.00") # capped by maximum_discount
