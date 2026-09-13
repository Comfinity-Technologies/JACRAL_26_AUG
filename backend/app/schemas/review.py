"""
JACRAL – Customer Review schemas.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=150)
    customer_location: Optional[str] = Field(default=None, max_length=100)
    customer_image_url: Optional[str] = Field(default=None, max_length=500)
    review_text: str = Field(min_length=1)
    rating: int = Field(ge=1, le=5, default=5)
    product_id: Optional[int] = None
    display_order: int = Field(default=1, ge=1)
    is_active: bool = True
    is_published: bool = False


class ReviewUpdate(BaseModel):
    customer_name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    customer_location: Optional[str] = Field(default=None, max_length=100)
    customer_image_url: Optional[str] = Field(default=None, max_length=500)
    review_text: Optional[str] = Field(default=None, min_length=1)
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    product_id: Optional[int] = None
    display_order: Optional[int] = Field(default=None, ge=1)
    is_active: Optional[bool] = None
    is_published: Optional[bool] = None


class ReviewPublicOut(BaseModel):
    """Returned to the customer frontend — only published reviews."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    customer_location: Optional[str] = None
    customer_image_url: Optional[str] = None
    review_text: str
    rating: int
    product_id: Optional[int] = None
    display_order: int


class ReviewAdminOut(BaseModel):
    """Full review data for the admin panel."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    customer_location: Optional[str] = None
    customer_image_url: Optional[str] = None
    review_text: str
    rating: int
    product_id: Optional[int] = None
    display_order: int
    is_active: bool
    is_published: bool
    created_at: datetime
    updated_at: datetime
