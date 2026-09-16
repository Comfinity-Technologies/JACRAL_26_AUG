"""
JACRAL – Public Content Routes.
Endpoints for customer website to fetch published branding and landing page data.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import WebsiteSetting, LandingPageSlide, LandingPageSection
from app.models.coupon import Coupon
from app.models.how_to_use import HowToUseStep
from app.schemas.content import (
    BrandPublicOut,
    HeroSlidePublicOut,
    LandingPagePublicOut,
    SectionPublicOut,
)
from app.schemas.how_to_use import HowToUseStepOut

router = APIRouter(tags=["Content (Public)"])


def _get_published_brand(db: Session) -> BrandPublicOut:
    settings = db.query(WebsiteSetting).all()
    setting_map = {s.key: s for s in settings}
    
    # Prefer draft values if they exist (so uploads show immediately on customer site)
    # Fall back to published if no draft is present
    brand_name = (
        setting_map.get("brand_name").draft_value 
        if setting_map.get("brand_name") and setting_map.get("brand_name").draft_value
        else (setting_map.get("brand_name").value if setting_map.get("brand_name") else "JACRAL")
    ) or "JACRAL"
    
    tagline = (
        setting_map.get("tagline").draft_value
        if setting_map.get("tagline") and setting_map.get("tagline").draft_value
        else (setting_map.get("tagline").value if setting_map.get("tagline") else "Pure Jackfruit Goodness · 100% Natural")
    )
    
    logo_url = (
        setting_map.get("logo_url").draft_value
        if setting_map.get("logo_url") and setting_map.get("logo_url").draft_value
        else (setting_map.get("logo_url").value if setting_map.get("logo_url") else None)
    )
    
    favicon_url = (
        setting_map.get("favicon_url").draft_value
        if setting_map.get("favicon_url") and setting_map.get("favicon_url").draft_value
        else (setting_map.get("favicon_url").value if setting_map.get("favicon_url") else None)
    )

    natural_goodness_image_url = (
        setting_map.get("natural_goodness_image_url").draft_value
        if setting_map.get("natural_goodness_image_url") and setting_map.get("natural_goodness_image_url").draft_value
        else (setting_map.get("natural_goodness_image_url").value if setting_map.get("natural_goodness_image_url") else None)
    )
    
    return BrandPublicOut(
        brand_name=brand_name,
        tagline=tagline,
        logo_url=logo_url,
        favicon_url=favicon_url,
        natural_goodness_image_url=natural_goodness_image_url,
    )


@router.get("/brand", response_model=BrandPublicOut, summary="Get published brand info and logo")
def get_brand(db: Session = Depends(get_db)):
    """
    Returns the currently published brand identity (logo, name, favicon).
    Customer frontend calls this to dynamically render the logo.
    """
    return _get_published_brand(db)


@router.get("/landing-page", response_model=LandingPagePublicOut, summary="Get published landing page content")
def get_landing_page(db: Session = Depends(get_db)):
    """
    Returns the complete published landing page content:
    - Published brand info & logo
    - Active hero slides (regardless of publish status - shows drafts too)
    - Active sections (shows drafts too)
    
    This allows admin drafts to be immediately visible on the customer site
    without requiring a "Publish" click for every change.
    """
    brand = _get_published_brand(db)

    # Get all active slides - both published AND draft
    # This way, newly created slides show immediately on customer site
    slides = (
        db.query(LandingPageSlide)
        .filter(LandingPageSlide.is_active.is_(True))
        .order_by(LandingPageSlide.display_order.asc(), LandingPageSlide.slide_number.asc())
        .all()
    )

    slide_outs = [
        HeroSlidePublicOut(
            id=s.id,
            slide_number=s.slide_number,
            display_order=s.display_order,
            title=s.title,
            subtitle=s.subtitle,
            description=s.description,
            cta_text=s.cta_text,
            cta_url=s.cta_url,
            secondary_cta_text=s.secondary_cta_text,
            secondary_cta_url=s.secondary_cta_url,
            # Prefer draft images if they exist (so uploads show immediately on customer site)
            image_url=s.draft_image_url if s.draft_image_url else s.image_url,
            mobile_image_url=s.draft_mobile_image_url if s.draft_mobile_image_url else s.mobile_image_url,
            is_active=s.is_active,
        )
        for s in slides
    ]

    # Get all active sections - both published AND draft
    sections = (
        db.query(LandingPageSection)
        .filter(LandingPageSection.is_active.is_(True))
        .all()
    )

    section_map = {
        sec.section_key: SectionPublicOut(
            section_key=sec.section_key,
            title=sec.title,
            subtitle=sec.subtitle,
            # Prefer draft content if it exists (so uploads show immediately on customer site)
            content=(sec.draft_content if sec.draft_content else sec.content) or {},
            is_active=sec.is_active,
        )
        for sec in sections
    }

    return LandingPagePublicOut(
        brand=brand,
        hero_slides=slide_outs,
        sections=section_map,
    )


# Site settings keys that hold configurable contact and social info
_SITE_SETTING_KEYS = [
    "contact_email",
    "contact_phone",
    "whatsapp_url",
    "instagram_url",
    "facebook_url",
    "youtube_url",
]


@router.get("/site-settings", summary="Get published site settings (contact & social)")
def get_site_settings(db: Session = Depends(get_db)):
    """
    Returns published site settings for contact details and social links.
    Only non-null values are included so the frontend can skip un-configured items.
    """
    settings = db.query(WebsiteSetting).filter(
        WebsiteSetting.key.in_(_SITE_SETTING_KEYS)
    ).all()
    setting_map = {s.key: s.value for s in settings}

    return {
        "contact_email": setting_map.get("contact_email") or None,
        "contact_phone": setting_map.get("contact_phone") or None,
        "whatsapp_url": setting_map.get("whatsapp_url") or None,
        "instagram_url": setting_map.get("instagram_url") or None,
        "facebook_url": setting_map.get("facebook_url") or None,
        "youtube_url": setting_map.get("youtube_url") or None,
    }


@router.get("/how-to-use", response_model=List[HowToUseStepOut], summary="Get active How To Use steps")
def get_how_to_use_steps(db: Session = Depends(get_db)):
    """
    Returns all active How To Use steps ordered by sort_order and step_number.
    """
    return (
        db.query(HowToUseStep)
        .filter(HowToUseStep.is_active.is_(True))
        .order_by(HowToUseStep.sort_order.asc(), HowToUseStep.step_number.asc())
        .all()
    )


@router.get("/coupons", summary="Get active promotional coupons for homepage display")
def get_active_coupons(db: Session = Depends(get_db)):
    """
    Returns active coupons with only public-safe fields for homepage promo section display.
    Does NOT expose usage_limit, used_count, or other sensitive data.
    """
    coupons = (
        db.query(Coupon)
        .filter(Coupon.is_active.is_(True))
        .order_by(Coupon.created_at.asc())
        .all()
    )
    return [
        {
            "code": c.code,
            "discount_type": c.discount_type,
            "discount_value": float(c.discount_value),
            "minimum_order_amount": float(c.minimum_order_amount),
            "description": c.description,
        }
        for c in coupons
    ]