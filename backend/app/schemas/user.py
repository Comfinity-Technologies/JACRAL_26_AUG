"""
JACRAL – User management schemas (admin).
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserRoleUpdate(BaseModel):
    role: str = Field(pattern="^(CUSTOMER|EMPLOYEE|ADMIN|SUPER_ADMIN|PRO_ADMIN)$")


class UserCreate(BaseModel):
    """Used by SUPER_ADMIN to create new staff/admin accounts."""
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    role: str = Field(pattern="^(EMPLOYEE|ADMIN|PRO_ADMIN|SUPER_ADMIN)$")
    phone: Optional[str] = Field(default=None, max_length=20)
