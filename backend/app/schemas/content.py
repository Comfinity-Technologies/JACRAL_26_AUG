"""
JACRAL – Pydantic schemas for CMS, Branding, Slides, and Sections.
"""
from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# -------------------------------------------------------------
# Brand Schemas
# -------------------------------------------------------------
class BrandPublicOut(BaseModel):
    brand_name: str = "JACRAL"
    tagline: Optional[str] = "Pure Jackfruit Goodness"
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class BrandAdminOut(BaseModel):
    brand_name: str = "JACRAL"
    tagline: Optional[str] = "Pure Jackfruit Goodness"
    logo_url: Optional[str] = None
    draft_logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    draft_favicon_url: Optional[str] = None
    is_published: bool = True

    model_config = ConfigDict(from_attributes=True)


class BrandUpdate(BaseModel):
    brand_name: Optional[str] = None
    tagline: Optional[str] = None


# -------------------------------------------------------------
# Slide Schemas
# -------------------------------------------------------------
class HeroSlidePublicOut(BaseModel):
    id: int
    slide_number: int
    display_order: int
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    cta_text: Optional[str] = None
    cta_url: Optional[str] = None
    secondary_cta_text: Optional[str] = None
    secondary_cta_url: Optional[str] = None
    image_url: Optional[str] = None
    mobile_image_url: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class HeroSlideAdminOut(BaseModel):
    id: int
    slide_number: int
    display_order: int

    # Published
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    cta_text: Optional[str] = None
    cta_url: Optional[str] = None
    secondary_cta_text: Optional[str] = None
    secondary_cta_url: Optional[str] = None
    image_url: Optional[str] = None
    mobile_image_url: Optional[str] = None
    is_active: bool

    # Draft
    draft_title: Optional[str] = None
    draft_subtitle: Optional[str] = None
    draft_description: Optional[str] = None
    draft_cta_text: Optional[str] = None
    draft_cta_url: Optional[str] = None
    draft_secondary_cta_text: Optional[str] = None
    draft_secondary_cta_url: Optional[str] = None
    draft_image_url: Optional[str] = None
    draft_mobile_image_url: Optional[str] = None
    draft_is_active: bool

    is_published: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class HeroSlideCreate(BaseModel):
    slide_number: int = 1
    display_order: int = 1
    draft_title: Optional[str] = None
    draft_subtitle: Optional[str] = None
    draft_description: Optional[str] = None
    draft_cta_text: Optional[str] = None
    draft_cta_url: Optional[str] = None
    draft_secondary_cta_text: Optional[str] = None
    draft_secondary_cta_url: Optional[str] = None
    draft_image_url: Optional[str] = None
    draft_mobile_image_url: Optional[str] = None
    draft_is_active: bool = True


class HeroSlideUpdate(BaseModel):
    display_order: Optional[int] = None
    draft_title: Optional[str] = None
    draft_subtitle: Optional[str] = None
    draft_description: Optional[str] = None
    draft_cta_text: Optional[str] = None
    draft_cta_url: Optional[str] = None
    draft_secondary_cta_text: Optional[str] = None
    draft_secondary_cta_url: Optional[str] = None
    draft_image_url: Optional[str] = None
    draft_mobile_image_url: Optional[str] = None
    draft_is_active: Optional[bool] = None


# -------------------------------------------------------------
# Section Schemas
# -------------------------------------------------------------
class SectionPublicOut(BaseModel):
    section_key: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class SectionAdminOut(BaseModel):
    id: int
    section_key: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    draft_content: Optional[Dict[str, Any]] = None
    is_active: bool
    draft_is_active: bool
    is_published: bool
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SectionUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    draft_content: Optional[Dict[str, Any]] = None
    draft_is_active: Optional[bool] = None


# -------------------------------------------------------------
# Combined Landing Page Schemas
# -------------------------------------------------------------
class LandingPagePublicOut(BaseModel):
    brand: BrandPublicOut
    hero_slides: List[HeroSlidePublicOut]
    sections: Dict[str, SectionPublicOut]


class AdminLandingPageOut(BaseModel):
    brand: BrandAdminOut
    hero_slides: List[HeroSlideAdminOut]
    sections: Dict[str, SectionAdminOut]
    has_unpublished_changes: bool = False
