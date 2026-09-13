"""
JACRAL – Coupon schemas.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CouponCreate(BaseModel):
    code: str = Field(min_length=2, max_length=50)
    description: Optional[str] = None
    discount_type: str = Field(pattern="^(percentage|fixed)$")
    discount_value: Decimal = Field(gt=0)
    minimum_order_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    maximum_discount: Optional[Decimal] = Field(default=None, gt=0)
    usage_limit: Optional[int] = Field(default=None, gt=0)
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True


class CouponUpdate(BaseModel):
    description: Optional[str] = None
    discount_value: Optional[Decimal] = Field(default=None, gt=0)
    minimum_order_amount: Optional[Decimal] = Field(default=None, ge=0)
    maximum_discount: Optional[Decimal] = Field(default=None, gt=0)
    usage_limit: Optional[int] = Field(default=None, gt=0)
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None


class CouponValidateRequest(BaseModel):
    code: str
    order_amount: Decimal = Field(gt=0)


class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_type: Optional[str] = None
    discount_value: Optional[Decimal] = None
    discount_amount: Optional[Decimal] = None
    message: str


class CouponOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: Decimal
    minimum_order_amount: Decimal
    maximum_discount: Optional[Decimal] = None
    usage_limit: Optional[int] = None
    used_count: int
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime
