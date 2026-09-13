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
    """
    items: list[OrderItemRequest] = Field(min_length=1)
    shipping_name: str = Field(min_length=1, max_length=100)
    shipping_email: EmailStr
    shipping_phone: str = Field(min_length=7, max_length=30)
    shipping_address: str = Field(min_length=10)
    coupon_code: Optional[str] = None
    notes: Optional[str] = None


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
    total_amount: Decimal
    discount_amount: Decimal
    coupon_code: Optional[str] = None
    shipping_name: str
    shipping_email: str
    shipping_phone: str
    shipping_address: str
    shipment_id: Optional[str] = None
    notes: Optional[str] = None
    items: list[OrderItemOut] = []
    created_at: datetime
    updated_at: datetime