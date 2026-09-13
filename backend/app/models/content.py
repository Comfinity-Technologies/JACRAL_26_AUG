"""
JACRAL – CMS & Content Models.
Models for dynamic website branding, landing page slides, sections, and media assets.
Supports Draft vs. Published workflow.
"""
from datetime import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class WebsiteSetting(Base):
    """
    Key-value store for site-wide settings such as brand name, logo, favicon.
    Supports draft vs. published state.
    """
    __tablename__ = "website_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)  # Published value
    draft_value = Column(Text, nullable=True)  # Draft value
    is_published = Column(Boolean, default=False, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)


class LandingPageSlide(Base):
    """
    Hero slider slides.
    Supports 3 (or more) slides with desktop/mobile images, typography, and CTAs.
    Each slide maintains a draft state and a published state.
    """
    __tablename__ = "landing_page_slides"

    id = Column(Integer, primary_key=True, index=True)
    slide_number = Column(Integer, nullable=False, default=1)  # 1, 2, 3
    display_order = Column(Integer, nullable=False, default=1)

    # Published fields
    title = Column(String(255), nullable=True)
    subtitle = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    cta_text = Column(String(100), nullable=True)
    cta_url = Column(String(255), nullable=True)
    secondary_cta_text = Column(String(100), nullable=True)
    secondary_cta_url = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    mobile_image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Draft fields (what admin edits before clicking Publish)
    draft_title = Column(String(255), nullable=True)
    draft_subtitle = Column(String(255), nullable=True)
    draft_description = Column(Text, nullable=True)
    draft_cta_text = Column(String(100), nullable=True)
    draft_cta_url = Column(String(255), nullable=True)
    draft_secondary_cta_text = Column(String(100), nullable=True)
    draft_secondary_cta_url = Column(String(255), nullable=True)
    draft_image_url = Column(String(500), nullable=True)
    draft_mobile_image_url = Column(String(500), nullable=True)
    draft_is_active = Column(Boolean, default=True, nullable=False)

    is_published = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)


class LandingPageSection(Base):
    """
    Configurable landing page sections (Story, Nutrition, Why Jackfruit, How Made, FAQ, etc.)
    Stores structured content as JSON with draft and published versions.
    """
    __tablename__ = "landing_page_sections"

    id = Column(Integer, primary_key=True, index=True)
    section_key = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=True)
    subtitle = Column(String(255), nullable=True)

    # Content stored as JSON for flexible schemas per section
    content = Column(JSONB, nullable=True)  # Published content
    draft_content = Column(JSONB, nullable=True)  # Draft content

    is_active = Column(Boolean, default=True, nullable=False)
    draft_is_active = Column(Boolean, default=True, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)


class MediaAsset(Base):
    """
    Track uploaded media files (logos, hero slides, banners, nutrition icons).
    """
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_url = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    asset_type = Column(String(50), nullable=False, default="general")  # 'logo', 'hero', 'section'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    uploader_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
