"""
JACRAL – Order schemas.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OrderItemRequest(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    """
    Customer sends product_id + quantity.
    Prices are calculated server-side from the database.
    accepted_terms MUST be True — the server rejects the request otherwise.
    """
    items: list[OrderItemRequest] = Field(min_length=1)
    shipping_name: str = Field(min_length=1, max_length=100)
    shipping_email: EmailStr
    shipping_phone: str = Field(min_length=7, max_length=30)
    shipping_address: str = Field(min_length=5)
    # Optional: delivery pincode for Shiprocket rate lookup
    delivery_pincode: Optional[str] = None
    coupon_code: Optional[str] = None
    notes: Optional[str] = None
    # Terms acceptance — must be True to place order
    accepted_terms: bool = False


class OrderStatusUpdate(BaseModel):
    status: str = Field(
        pattern="^(pending|confirmed|processing|packed|shipped|out_for_delivery|delivered|cancelled)$"
    )


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    subtotal: Decimal


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: str
    payment_status: str
    subtotal: Decimal = Decimal("0.00")
    tax_amount: Decimal = Decimal("0.00")
    shipping_charge: Decimal = Decimal("0.00")
    discount_amount: Decimal = Decimal("0.00")
    total_amount: Decimal
    coupon_code: Optional[str] = None
    shipping_name: str
    shipping_email: str
    shipping_phone: str
    shipping_address: str
    shipment_id: Optional[str] = None
    notes: Optional[str] = None
    accepted_terms: bool = False
    accepted_terms_at: Optional[datetime] = None
    items: list[OrderItemOut] = []
    created_at: datetime
    updated_at: datetime


class OrderEstimateRequest(BaseModel):
    """Request body for the pre-checkout estimate endpoint."""
    items: list[OrderItemRequest] = Field(min_length=1)
    delivery_pincode: Optional[str] = None
    coupon_code: Optional[str] = None


class OrderEstimateOut(BaseModel):
    """Pre-checkout price breakdown shown in the order summary sidebar."""
    subtotal: Decimal
    shipping_charge: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    shipping_available: bool
    coupon_applied: bool
    coupon_discount_type: Optional[str] = None
    coupon_discount_value: Optional[float] = None