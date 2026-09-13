"""
JACRAL – How To Use Step schemas.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class HowToUseStepBase(BaseModel):
    step_number: int = Field(ge=1, le=10)
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    image_url: Optional[str] = Field(default=None, max_length=500)
    sort_order: int = Field(default=1, ge=1)
    is_active: bool = True


class HowToUseStepCreate(HowToUseStepBase):
    pass


class HowToUseStepUpdate(BaseModel):
    step_number: Optional[int] = Field(default=None, ge=1, le=10)
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, min_length=1)
    image_url: Optional[str] = Field(default=None, max_length=500)
    sort_order: Optional[int] = Field(default=None, ge=1)
    is_active: Optional[bool] = None


class HowToUseStepOut(HowToUseStepBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
