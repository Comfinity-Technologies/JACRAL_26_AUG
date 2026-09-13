"""
JACRAL – Auth schemas.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    phone: Optional[str] = Field(default=None, max_length=20)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_active: bool
    mfa_enabled: bool = False
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[UserOut] = None
    mfa_required: bool = False
    mfa_token: Optional[str] = None

class MFASetupResponse(BaseModel):
    secret: str
    qr_code_svg: str
    qr_code_image: str
    uri: str

class MFAVerifyRequest(BaseModel):
    code: str

class MFAChallengeRequest(BaseModel):
    mfa_token: str
    code: str