"""
JACRAL – Public content routes.

GET /api/v1/content/sections/{section_key}   Published LandingPageSection content
GET /api/v1/content/slides                   Published hero slides
GET /api/v1/content/how-to-use              Active HowToUseStep rows
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import LandingPageSection, LandingPageSlide
from app.models.how_to_use import HowToUseStep

router = APIRouter(tags=["Content"])


from app.models.content import LandingPageSection, LandingPageSlide, WebsiteSetting
from app.schemas.content import LandingPagePublicOut, BrandPublicOut, HeroSlidePublicOut, SectionPublicOut

@router.get("/landing-page", response_model=LandingPagePublicOut, summary="Get full published CMS landing page data")
def get_landing_page(db: Session = Depends(get_db)):
    # Brand
    settings = db.query(WebsiteSetting).filter(WebsiteSetting.is_published == True).all()
    setting_map = {s.key: s for s in settings}

    brand_name = setting_map.get("brand_name").value if "brand_name" in setting_map else "JACRAL"
    tagline = setting_map.get("tagline").value if "tagline" in setting_map else "Pure Jackfruit Goodness"
    logo_url = setting_map.get("logo_url").value if "logo_url" in setting_map else None
    favicon_url = setting_map.get("favicon_url").value if "favicon_url" in setting_map else None
    natural_goodness_image_url = setting_map.get("natural_goodness_image_url").value if "natural_goodness_image_url" in setting_map else None

    brand_out = BrandPublicOut(
        brand_name=brand_name or "JACRAL",
        tagline=tagline,
        logo_url=logo_url,
        favicon_url=favicon_url,
        natural_goodness_image_url=natural_goodness_image_url,
    )

    # Slides
    slides = db.query(LandingPageSlide).filter(
        LandingPageSlide.is_active == True,
        LandingPageSlide.is_published == True
    ).order_by(LandingPageSlide.display_order.asc(), LandingPageSlide.slide_number.asc()).all()
    slide_outs = [HeroSlidePublicOut.model_validate(s) for s in slides]

    # Sections
    sections = db.query(LandingPageSection).filter(LandingPageSection.is_published == True).all()
    section_map = {
        sec.section_key: SectionPublicOut.model_validate({
            "section_key": sec.section_key,
            "title": sec.title,
            "subtitle": sec.subtitle,
            "content": sec.content,
            "is_active": sec.is_active,
        }) for sec in sections
    }

    return LandingPagePublicOut(
        brand=brand_out,
        hero_slides=slide_outs,
        sections=section_map,
    )


@router.get(
    "/sections/{section_key}",
    summary="Get published content for a landing page section",
)
def get_section(section_key: str, db: Session = Depends(get_db)):
    """
    Returns the published content for a section.
    Falls back to draft_content if the section has never been published
    (so the site never shows a completely broken/empty block).
    Returns 404 if the section doesn't exist in the database at all.
    """
    section = (
        db.query(LandingPageSection)
        .filter(LandingPageSection.section_key == section_key)
        .first()
    )

    if not section:
        raise HTTPException(status_code=404, detail=f"Section '{section_key}' not found.")

    # Return published content if available, otherwise fall back to draft
    content = section.content if section.is_published and section.content else section.draft_content

    return {
        "section_key": section.section_key,
        "title": section.title,
        "subtitle": section.subtitle,
        "content": content,
        "is_published": section.is_published,
        "is_active": section.is_active,
    }


@router.get("/slides", summary="Get all published, active hero slides")
def get_slides(db: Session = Depends(get_db)):
    slides = (
        db.query(LandingPageSlide)
        .filter(LandingPageSlide.is_active.is_(True))
        .order_by(LandingPageSlide.display_order.asc(), LandingPageSlide.slide_number.asc())
        .all()
    )
    return [
        {
            "id": s.id,
            "slide_number": s.slide_number,
            "display_order": s.display_order,
            "title": s.title,
            "subtitle": s.subtitle,
            "description": s.description,
            "cta_text": s.cta_text,
            "cta_url": s.cta_url,
            "secondary_cta_text": s.secondary_cta_text,
            "secondary_cta_url": s.secondary_cta_url,
            "image_url": s.image_url,
            "mobile_image_url": s.mobile_image_url,
        }
        for s in slides
    ]


@router.get("/how-to-use", summary="Get all active How To Use steps")
def get_how_to_use(db: Session = Depends(get_db)):
    steps = (
        db.query(HowToUseStep)
        .filter(HowToUseStep.is_active.is_(True))
        .order_by(HowToUseStep.sort_order.asc(), HowToUseStep.step_number.asc())
        .all()
    )
    return [
        {
            "id": s.id,
            "step_number": s.step_number,
            "title": s.title,
            "description": s.description,
            "image_url": s.image_url,
            "sort_order": s.sort_order,
        }
        for s in steps
    ]
