"""
JACRAL – Admin CMS & Content Management Routes.

Endpoints:
GET    /api/v1/admin/content/landing-page          - Retrieve all CMS draft & published data
POST   /api/v1/admin/content/brand                 - Update brand name / tagline draft
POST   /api/v1/admin/content/brand/logo            - Upload brand logo (multipart)
DELETE /api/v1/admin/content/brand/logo            - Remove brand logo
POST   /api/v1/admin/content/brand/favicon         - Upload brand favicon (multipart)
POST   /api/v1/admin/content/landing-page/slides   - Create slide (draft)
PUT    /api/v1/admin/content/landing-page/slides/{id} - Update slide draft details
DELETE /api/v1/admin/content/landing-page/slides/{id} - Delete slide
POST   /api/v1/admin/content/landing-page/slides/{id}/image - Upload slide image (multipart)
POST   /api/v1/admin/content/landing-page/sections - Update section draft content
POST   /api/v1/admin/content/landing-page/publish  - Promote all drafts to published (LIVE)
"""
import os
import uuid
import re
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import WebsiteSetting, LandingPageSlide, LandingPageSection, MediaAsset
from app.models.how_to_use import HowToUseStep
from app.models.user import User
from app.schemas.content import (
    AdminLandingPageOut,
    BrandAdminOut,
    BrandUpdate,
    HeroSlideAdminOut,
    HeroSlideCreate,
    HeroSlideUpdate,
    SectionAdminOut,
    SectionUpdate,
)
from app.schemas.how_to_use import (
    HowToUseStepCreate,
    HowToUseStepOut,
    HowToUseStepUpdate,
)
from app.security.permissions import require_admin, require_employee
from app.services import audit_service

router = APIRouter(tags=["Admin – Website Content"])

UPLOAD_ROOT = Path(__file__).resolve().parents[3] / "static" / "uploads" / "content"
BRAND_DIR = UPLOAD_ROOT / "brand"
SLIDES_DIR = UPLOAD_ROOT / "slides"

BRAND_DIR.mkdir(parents=True, exist_ok=True)
SLIDES_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_MIME = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon": "ico",
    "image/svg+xml": "svg",
}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


def _sanitize_filename(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_.-]", "_", name)
    return cleaned[:60]


async def _save_upload_file(file: UploadFile, dest_dir: Path, prefix: str) -> tuple[str, str, int]:
    """
    Validates and saves uploaded file via Cloudinary or local fallback.
    Returns (filename, url, file_size).
    """
    contents = await file.read()
    file_size = len(contents)

    if file_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large ({file_size / (1024 * 1024):.1f} MB). Max allowed size is 5 MB."
        )

    mime = file.content_type
    if not mime or mime.lower() not in ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format ({mime}). Allowed formats: JPG, JPEG, PNG, WebP, SVG, ICO."
        )

    from app.services.cloudinary_service import upload_image_to_storage

    rel_url = upload_image_to_storage(
        file_bytes=contents,
        folder=dest_dir.name or "content",
        filename=file.filename,
        local_fallback_dir=dest_dir,
    )

    # Extract filename from URL for MediaAsset record
    stored_filename = rel_url.split("/")[-1].split("?")[0] or f"{prefix}_{uuid.uuid4().hex[:8]}"
    return stored_filename, rel_url, file_size


# -------------------------------------------------------------
# GET: Admin Landing Page CMS State
# -------------------------------------------------------------
@router.get("/landing-page", response_model=AdminLandingPageOut, summary="Get full CMS landing page data for admin")
def get_admin_landing_page(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_employee),
):
    # Brand
    settings = db.query(WebsiteSetting).all()
    setting_map = {s.key: s for s in settings}

    brand_name = setting_map.get("brand_name").value if "brand_name" in setting_map else "JACRAL"
    tagline = setting_map.get("tagline").value if "tagline" in setting_map else "Pure Jackfruit Goodness"
    logo_url = setting_map.get("logo_url").value if "logo_url" in setting_map else None
    draft_logo_url = setting_map.get("logo_url").draft_value if "logo_url" in setting_map else None
    favicon_url = setting_map.get("favicon_url").value if "favicon_url" in setting_map else None
    draft_favicon_url = setting_map.get("favicon_url").draft_value if "favicon_url" in setting_map else None

    brand_out = BrandAdminOut(
        brand_name=brand_name or "JACRAL",
        tagline=tagline,
        logo_url=logo_url,
        draft_logo_url=draft_logo_url,
        favicon_url=favicon_url,
        draft_favicon_url=draft_favicon_url,
        is_published=all(s.is_published for s in settings) if settings else True,
    )

    # Slides
    slides = db.query(LandingPageSlide).order_by(LandingPageSlide.display_order.asc(), LandingPageSlide.slide_number.asc()).all()
    slide_outs = [HeroSlideAdminOut.model_validate(s) for s in slides]

    # Sections
    sections = db.query(LandingPageSection).all()
    section_map = {sec.section_key: SectionAdminOut.model_validate(sec) for sec in sections}

    # Unpublished changes check
    has_brand_unpub = any(not s.is_published for s in settings)
    has_slide_unpub = any(not s.is_published for s in slides)
    has_sec_unpub = any(not s.is_published for s in sections)
    has_unpublished = has_brand_unpub or has_slide_unpub or has_sec_unpub

    return AdminLandingPageOut(
        brand=brand_out,
        hero_slides=slide_outs,
        sections=section_map,
        has_unpublished_changes=has_unpublished,
    )


# -------------------------------------------------------------
# Brand Logo & Settings Management
# -------------------------------------------------------------
@router.post("/brand", summary="Update brand name and tagline draft")
def update_brand(
    data: BrandUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if data.brand_name is not None:
        setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == "brand_name").first()
        if not setting:
            setting = WebsiteSetting(key="brand_name", draft_value=data.brand_name, is_published=False)
            db.add(setting)
        else:
            setting.draft_value = data.brand_name
            setting.is_published = False
            setting.updated_by = admin.id

    if data.tagline is not None:
        setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == "tagline").first()
        if not setting:
            setting = WebsiteSetting(key="tagline", draft_value=data.tagline, is_published=False)
            db.add(setting)
        else:
            setting.draft_value = data.tagline
            setting.is_published = False
            setting.updated_by = admin.id

    db.commit()
    audit_service.log_action(db, "BRAND_DRAFT_UPDATED", admin.id, "website_setting", "brand")
    db.commit()
    return {"success": True, "message": "Brand settings saved as draft."}


@router.post("/brand/logo", summary="Upload brand logo (draft)")
async def upload_brand_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    filename, rel_url, file_size = await _save_upload_file(file, BRAND_DIR, "logo")

    # Record media asset
    _is_remote = rel_url.startswith("http")
    media = MediaAsset(
        filename=filename,
        original_name=file.filename or "logo",
        file_path=rel_url if _is_remote else str(BRAND_DIR / filename),
        file_url=rel_url,
        mime_type=file.content_type or "image/png",
        file_size=file_size,
        asset_type="logo",
        uploader_id=admin.id,
    )
    db.add(media)

    # Save to website_settings as draft
    setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == "logo_url").first()
    if not setting:
        setting = WebsiteSetting(
            key="logo_url",
            value=None,
            draft_value=rel_url,
            is_published=False,
            updated_by=admin.id,
        )
        db.add(setting)
    else:
        setting.draft_value = rel_url
        setting.is_published = False
        setting.updated_by = admin.id

    db.commit()
    audit_service.log_action(db, "BRAND_LOGO_UPLOADED", admin.id, "website_setting", "logo_url", {"url": rel_url})
    db.commit()

    return {
        "success": True,
        "message": "Logo uploaded successfully as draft. Click Publish to make it live.",
        "draft_logo_url": rel_url,
    }


@router.delete("/brand/logo", summary="Remove brand logo draft")
def remove_brand_logo(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == "logo_url").first()
    if setting:
        setting.draft_value = None
        setting.is_published = False
        setting.updated_by = admin.id
        db.commit()
        audit_service.log_action(db, "BRAND_LOGO_REMOVED", admin.id, "website_setting", "logo_url")
        db.commit()

    return {"success": True, "message": "Brand logo removed in draft."}


@router.post("/brand/favicon", summary="Upload brand favicon (draft)")
async def upload_brand_favicon(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    filename, rel_url, file_size = await _save_upload_file(file, BRAND_DIR, "favicon")

    _is_remote = rel_url.startswith("http")
    media = MediaAsset(
        filename=filename,
        original_name=file.filename or "favicon",
        file_path=rel_url if _is_remote else str(BRAND_DIR / filename),
        file_url=rel_url,
        mime_type=file.content_type or "image/png",
        file_size=file_size,
        asset_type="favicon",
        uploader_id=admin.id,
    )
    db.add(media)

    setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == "favicon_url").first()
    if not setting:
        setting = WebsiteSetting(key="favicon_url", draft_value=rel_url, is_published=False, updated_by=admin.id)
        db.add(setting)
    else:
        setting.draft_value = rel_url
        setting.is_published = False
        setting.updated_by = admin.id

    db.commit()
    return {"success": True, "message": "Favicon uploaded as draft.", "draft_favicon_url": rel_url}


# -------------------------------------------------------------
# Hero Slides Management
# -------------------------------------------------------------
@router.post("/landing-page/slides", response_model=HeroSlideAdminOut, status_code=status.HTTP_201_CREATED, summary="Create a new slide (draft)")
def create_slide(
    data: HeroSlideCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    slide = LandingPageSlide(
        slide_number=data.slide_number,
        display_order=data.display_order,
        draft_title=data.draft_title,
        draft_subtitle=data.draft_subtitle,
        draft_description=data.draft_description,
        draft_cta_text=data.draft_cta_text,
        draft_cta_url=data.draft_cta_url,
        draft_secondary_cta_text=data.draft_secondary_cta_text,
        draft_secondary_cta_url=data.draft_secondary_cta_url,
        draft_image_url=data.draft_image_url,
        draft_mobile_image_url=data.draft_mobile_image_url,
        draft_is_active=data.draft_is_active,
        is_published=False,
        updated_by=admin.id,
    )
    db.add(slide)
    db.commit()
    db.refresh(slide)
    audit_service.log_action(db, "HERO_SLIDE_CREATED", admin.id, "landing_page_slide", str(slide.id))
    db.commit()
    return slide


@router.put("/landing-page/slides/{slide_id}", response_model=HeroSlideAdminOut, summary="Update slide draft")
def update_slide(
    slide_id: int,
    data: HeroSlideUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    slide = db.query(LandingPageSlide).filter(LandingPageSlide.id == slide_id).first()
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")

    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(slide, field, val)

    slide.updated_by = admin.id
    db.commit()
    db.refresh(slide)
    audit_service.log_action(db, "HERO_SLIDE_DRAFT_UPDATED", admin.id, "landing_page_slide", str(slide.id))
    db.commit()
    return slide


@router.delete("/landing-page/slides/{slide_id}", summary="Delete a slide")
def delete_slide(
    slide_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    slide = db.query(LandingPageSlide).filter(LandingPageSlide.id == slide_id).first()
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")

    db.delete(slide)
    db.commit()
    audit_service.log_action(db, "HERO_SLIDE_DELETED", admin.id, "landing_page_slide", str(slide_id))
    db.commit()
    return {"success": True, "message": "Slide deleted successfully"}


@router.post("/landing-page/slides/{slide_id}/image", summary="Upload hero slide image (draft)")
async def upload_slide_image(
    slide_id: int,
    target: str = Form(default="desktop"),  # "desktop" or "mobile"
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    slide = db.query(LandingPageSlide).filter(LandingPageSlide.id == slide_id).first()
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")

    filename, rel_url, file_size = await _save_upload_file(file, SLIDES_DIR, f"slide_{slide_id}_{target}")

    _is_remote = rel_url.startswith("http")
    media = MediaAsset(
        filename=filename,
        original_name=file.filename or "slide_image",
        file_path=rel_url if _is_remote else str(SLIDES_DIR / filename),
        file_url=rel_url,
        mime_type=file.content_type or "image/jpeg",
        file_size=file_size,
        asset_type="hero_slide",
        uploader_id=admin.id,
    )
    db.add(media)

    if target == "mobile":
        slide.draft_mobile_image_url = rel_url
    else:
        slide.draft_image_url = rel_url

    slide.updated_by = admin.id
    db.commit()
    db.refresh(slide)

    audit_service.log_action(
        db,
        "HERO_SLIDE_IMAGE_UPLOADED",
        admin.id,
        "landing_page_slide",
        str(slide_id),
        {"target": target, "url": rel_url},
    )
    db.commit()

    return {
        "success": True,
        "message": f"Slide {target} image uploaded as draft. Click Publish to make live.",
        "image_url": rel_url,
        "slide": HeroSlideAdminOut.model_validate(slide),
    }


# -------------------------------------------------------------
# Section Management
# -------------------------------------------------------------
@router.post("/landing-page/sections/{section_key}", summary="Update section draft content")
def update_section(
    section_key: str,
    data: SectionUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    section = db.query(LandingPageSection).filter(LandingPageSection.section_key == section_key).first()
    if not section:
        section = LandingPageSection(
            section_key=section_key,
            title=data.title,
            subtitle=data.subtitle,
            draft_content=data.draft_content,
            draft_is_active=data.draft_is_active if data.draft_is_active is not None else True,
            is_published=False,
            updated_by=admin.id,
        )
        db.add(section)
    else:
        if data.title is not None:
            section.title = data.title
        if data.subtitle is not None:
            section.subtitle = data.subtitle
        if data.draft_content is not None:
            section.draft_content = data.draft_content
        if data.draft_is_active is not None:
            section.draft_is_active = data.draft_is_active
        section.is_published = False
        section.updated_by = admin.id

    db.commit()
    db.refresh(section)
    audit_service.log_action(db, "SECTION_DRAFT_UPDATED", admin.id, "landing_page_section", section_key)
    db.commit()
    return {"success": True, "message": f"Section '{section_key}' updated as draft."}


# -------------------------------------------------------------
# PUBLISH: Promote Draft to Live Customer Website
# -------------------------------------------------------------
@router.post("/landing-page/publish", summary="Publish all pending drafts to live website")
def publish_landing_page(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Promotes ALL draft changes to published state.
    Customer website immediately receives the published updates upon refresh.
    """
    # 1. Publish website settings (Brand, Logo, Favicon)
    settings = db.query(WebsiteSetting).all()
    for s in settings:
        s.value = s.draft_value
        s.is_published = True
        s.updated_by = admin.id

    # 2. Publish all slides
    slides = db.query(LandingPageSlide).all()
    for s in slides:
        s.title = s.draft_title
        s.subtitle = s.draft_subtitle
        s.description = s.draft_description
        s.cta_text = s.draft_cta_text
        s.cta_url = s.draft_cta_url
        s.secondary_cta_text = s.draft_secondary_cta_text
        s.secondary_cta_url = s.draft_secondary_cta_url
        s.image_url = s.draft_image_url
        s.mobile_image_url = s.draft_mobile_image_url
        s.is_active = s.draft_is_active
        s.is_published = True
        s.updated_by = admin.id

    # 3. Publish all sections
    sections = db.query(LandingPageSection).all()
    for sec in sections:
        sec.content = sec.draft_content
        sec.is_active = sec.draft_is_active
        sec.is_published = True
        sec.updated_by = admin.id

    db.commit()
    audit_service.log_action(db, "LANDING_PAGE_PUBLISHED", admin.id, "cms", "landing_page")
    db.commit()

    return {
        "success": True,
        "message": "Landing page and brand changes have been successfully published live!",
        "published_slides": len(slides),
        "published_sections": len(sections),
    }


# -------------------------------------------------------------
# Site Settings Management (Contact Info, Social Media)
# -------------------------------------------------------------
_ALLOWED_SITE_SETTING_KEYS = {
    "contact_email",
    "contact_phone",
    "whatsapp_url",
    "instagram_url",
    "facebook_url",
    "youtube_url",
}


@router.post("/site-settings", summary="Update site settings (contact info, social links)")
def update_site_settings(
    data: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Update configurable site settings such as contact email, phone, WhatsApp, and social links.
    Changes are immediately published (no draft/publish workflow for contact info).
    """
    updated_keys = []
    for key, value in data.items():
        if key not in _ALLOWED_SITE_SETTING_KEYS:
            continue  # Silently skip disallowed keys
        setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == key).first()
        if not setting:
            setting = WebsiteSetting(
                key=key,
                value=value,
                draft_value=value,
                is_published=True,
                updated_by=admin.id,
            )
            db.add(setting)
        else:
            setting.value = value
            setting.draft_value = value
            setting.is_published = True
            setting.updated_by = admin.id
        updated_keys.append(key)

    db.commit()
    audit_service.log_action(db, "SITE_SETTINGS_UPDATED", admin.id, "website_setting", "site_settings")
    db.commit()
    return {"success": True, "message": "Site settings updated successfully.", "updated_keys": updated_keys}


@router.get("/site-settings", summary="Get all site settings for admin")
def get_admin_site_settings(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_employee),
):
    """Returns all configurable site settings for admin management."""
    settings = db.query(WebsiteSetting).filter(
        WebsiteSetting.key.in_(_ALLOWED_SITE_SETTING_KEYS)
    ).all()
    return {s.key: s.value for s in settings}


# -------------------------------------------------------------
# How To Use Step Image Upload
# -------------------------------------------------------------
HOW_TO_USE_DIR = UPLOAD_ROOT / "how_to_use"
HOW_TO_USE_DIR.mkdir(parents=True, exist_ok=True)


@router.post(
    "/landing-page/sections/how_to_use/steps/{step_number}/image",
    summary="Upload image for a How To Use step",
)
async def upload_how_to_use_step_image(
    step_number: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Upload an image for a specific How To Use step (1, 2, or 3).
    The URL is stored in the how_to_use section's draft content.
    Admin must Publish to make it live.
    """
    if step_number not in (1, 2, 3, 4):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Step number must be 1, 2, 3, or 4.")

    filename, rel_url, file_size = await _save_upload_file(
        file, HOW_TO_USE_DIR, f"how_to_use_step{step_number}"
    )

    # Record media asset (file_path may be a Cloudinary URL or local path)
    is_remote = rel_url.startswith("http")
    media = MediaAsset(
        filename=filename,
        original_name=file.filename or f"step{step_number}",
        file_path=rel_url if is_remote else str(HOW_TO_USE_DIR / filename),
        file_url=rel_url,
        mime_type=file.content_type or "image/jpeg",
        file_size=file_size,
        asset_type="how_to_use",
        uploader_id=admin.id,
    )
    db.add(media)

    # Find or create how_to_use section
    section = db.query(LandingPageSection).filter(
        LandingPageSection.section_key == "how_to_use"
    ).first()

    if not section:
        section = LandingPageSection(
            section_key="how_to_use",
            title="How To Use",
            draft_content={"steps": [{}, {}, {}]},
            draft_is_active=True,
            is_published=False,
            updated_by=admin.id,
        )
        db.add(section)
        db.commit()
        db.refresh(section)

    # Update the image_url for the specific step in draft_content
    draft = dict(section.draft_content or {})
    steps = list(draft.get("steps", [{}, {}, {}, {}]))
    # Ensure list is long enough for 4 steps
    while len(steps) < 4:
        steps.append({})

    idx = step_number - 1
    steps[idx] = {**steps[idx], "image_url": rel_url}
    draft["steps"] = steps
    section.draft_content = draft
    section.is_published = False
    section.updated_by = admin.id

    # Also update the persistent HowToUseStep model record if present
    step_record = db.query(HowToUseStep).filter(HowToUseStep.step_number == step_number).first()
    if step_record:
        step_record.image_url = rel_url

    db.commit()
    audit_service.log_action(
        db, "HOW_TO_USE_IMAGE_UPLOADED", admin.id, "landing_page_section",
        "how_to_use", {"step": step_number, "url": rel_url}
    )
    db.commit()

    return {
        "success": True,
        "message": f"Step {step_number} image uploaded. Click Publish to make live.",
        "image_url": rel_url,
        "step_number": step_number,
    }


# -------------------------------------------------------------
# Dedicated How To Use Steps Management Routes
# -------------------------------------------------------------

@router.get(
    "/how-to-use",
    summary="List all How To Use steps for admin",
)
def admin_list_how_to_use_steps(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_employee),
):
    return (
        db.query(HowToUseStep)
        .order_by(HowToUseStep.sort_order.asc(), HowToUseStep.step_number.asc())
        .all()
    )


@router.post(
    "/how-to-use",
    status_code=status.HTTP_201_CREATED,
    summary="Create a How To Use step",
)
def admin_create_how_to_use_step(
    data: HowToUseStepCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    step = HowToUseStep(
        step_number=data.step_number,
        title=data.title,
        description=data.description,
        image_url=data.image_url,
        sort_order=data.sort_order,
        is_active=data.is_active,
    )
    db.add(step)
    db.commit()
    db.refresh(step)
    audit_service.log_action(db, "HOW_TO_USE_STEP_CREATED", admin.id, "how_to_use_step", str(step.id))
    db.commit()
    return step


@router.put(
    "/how-to-use/{step_id}",
    summary="Update a How To Use step",
)
def admin_update_how_to_use_step(
    step_id: int,
    data: HowToUseStepUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    step = db.query(HowToUseStep).filter(HowToUseStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")

    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(step, field, val)

    db.commit()
    db.refresh(step)
    audit_service.log_action(db, "HOW_TO_USE_STEP_UPDATED", admin.id, "how_to_use_step", str(step_id))
    db.commit()
    return step


@router.delete(
    "/how-to-use/{step_id}",
    summary="Delete a How To Use step",
)
def admin_delete_how_to_use_step(
    step_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    step = db.query(HowToUseStep).filter(HowToUseStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")

    db.delete(step)
    db.commit()
    audit_service.log_action(db, "HOW_TO_USE_STEP_DELETED", admin.id, "how_to_use_step", str(step_id))
    db.commit()
    return {"success": True, "message": "Step deleted successfully"}


@router.post(
    "/how-to-use/{step_id}/image",
    summary="Upload image for a specific step ID",
)
async def admin_upload_step_image_by_id(
    step_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    step = db.query(HowToUseStep).filter(HowToUseStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")

    filename, rel_url, file_size = await _save_upload_file(
        file, HOW_TO_USE_DIR, f"how_to_use_step_{step.step_number}"
    )

    is_remote = rel_url.startswith("http")
    media = MediaAsset(
        filename=filename,
        original_name=file.filename or f"step_{step.step_number}",
        file_path=rel_url if is_remote else str(HOW_TO_USE_DIR / filename),
        file_url=rel_url,
        mime_type=file.content_type or "image/jpeg",
        file_size=file_size,
        asset_type="how_to_use",
        uploader_id=admin.id,
    )
    db.add(media)

    step.image_url = rel_url
    db.commit()
    db.refresh(step)
    audit_service.log_action(db, "HOW_TO_USE_STEP_IMAGE_UPLOADED", admin.id, "how_to_use_step", str(step_id))
    db.commit()
    return step


