"""
JACRAL – Coupon schemas.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CouponCreate(BaseModel):
    code: str = Field(min_length=2, max_length=50)
    description: Optional[str] = None
    discount_type: str = Field(pattern="^(percentage|fixed)$")
    discount_value: float = Field(gt=0)
    min_purchase_amount: float = Field(default=0.0, ge=0)
    max_discount_amount: Optional[float] = Field(default=None, gt=0)
    usage_limit: Optional[int] = Field(default=None, gt=0)
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True
    is_featured: bool = False


class CouponUpdate(BaseModel):
    description: Optional[str] = None
    discount_value: Optional[float] = Field(default=None, gt=0)
    min_purchase_amount: Optional[float] = Field(default=None, ge=0)
    max_discount_amount: Optional[float] = Field(default=None, gt=0)
    usage_limit: Optional[int] = Field(default=None, gt=0)
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class CouponValidateRequest(BaseModel):
    code: str
    order_amount: float = Field(gt=0)


class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    discount_amount: Optional[float] = None
    message: str


class CouponPublicOut(BaseModel):
    """Safe-to-expose subset of a coupon, used for the public storefront banner."""
    model_config = ConfigDict(from_attributes=True)

    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: float
    min_purchase_amount: float
    max_discount_amount: Optional[float] = None


class CouponOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: float
    min_purchase_amount: float
    max_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    used_count: int
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool
    is_featured: bool
    created_at: datetime