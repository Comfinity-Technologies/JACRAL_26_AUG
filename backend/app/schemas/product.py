"""
JACRAL – Product schemas.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=150,
    )

    category_id: Optional[int] = None

    description: str

    price: Decimal = Field(
        gt=0,
        decimal_places=2,
    )

    discount_price: Optional[Decimal] = Field(
        default=None,
        gt=0,
        decimal_places=2,
    )

    stock: int = Field(
        ge=0,
    )

    weight: Optional[Decimal] = None

    unit: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    sku: Optional[str] = Field(
        default=None,
        max_length=80,
    )

    # Main image URL
    image_url: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    # Hover image URL
    hover_image_url: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    badge: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    featured: bool = False

    is_active: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    category_id: Optional[int] = None

    description: Optional[str] = None

    price: Optional[Decimal] = Field(
        default=None,
        gt=0,
        decimal_places=2,
    )

    discount_price: Optional[Decimal] = Field(
        default=None,
        gt=0,
        decimal_places=2,
    )

    stock: Optional[int] = Field(
        default=None,
        ge=0,
    )

    weight: Optional[Decimal] = None

    unit: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    sku: Optional[str] = Field(
        default=None,
        max_length=80,
    )

    image_url: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    hover_image_url: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    badge: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    featured: Optional[bool] = None

    is_active: Optional[bool] = None


class ProductStatusUpdate(BaseModel):
    is_active: bool


class ProductOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    name: str

    slug: str

    sku: Optional[str] = None

    category_id: Optional[int] = None

    description: str

    price: Decimal

    discount_price: Optional[Decimal] = None

    stock: int

    weight: Optional[Decimal] = None

    unit: Optional[str] = None

    # Main image
    image_url: Optional[str] = None

    # Hover image
    hover_image_url: Optional[str] = None

    badge: Optional[str] = None

    featured: bool

    is_active: bool

    created_at: datetime

    updated_at: datetime