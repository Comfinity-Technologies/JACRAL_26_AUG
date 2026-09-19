"""
JACRAL – Deal card schemas.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DealCreate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    link_url: Optional[str] = None
    display_order: int = 1
    is_active: bool = True
    bg_color: Optional[str] = "#FF7000"
    text_color: Optional[str] = "#ffffff"


class DealUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    link_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None
    bg_color: Optional[str] = None
    text_color: Optional[str] = None


class DealPublicOut(BaseModel):
    """Safe-to-expose subset shown on the Shop page deals row."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    link_url: Optional[str] = None
    display_order: int
    bg_color: Optional[str] = "#FF7000"
    text_color: Optional[str] = "#ffffff"


class DealAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    link_url: Optional[str] = None
    display_order: int
    is_active: bool
    bg_color: Optional[str] = "#FF7000"
    text_color: Optional[str] = "#ffffff"
    created_at: datetime