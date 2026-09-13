"""
JACRAL – Pydantic schemas for site policies.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class PolicyCreate(BaseModel):
    slug: str = Field(..., max_length=50)
    title: str = Field(..., max_length=120)
    content: str
    is_active: bool = True


class PolicyUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_active: Optional[bool] = None


class PolicyOut(BaseModel):
    id: int
    slug: str
    title: str
    content: str
    is_active: bool
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
