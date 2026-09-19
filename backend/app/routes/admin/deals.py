"""
JACRAL – Admin: Deal card management.

GET    /api/v1/admin/deals              - List all deals
POST   /api/v1/admin/deals              - Create deal (image required, multipart)
PATCH  /api/v1/admin/deals/{id}         - Update deal fields
POST   /api/v1/admin/deals/{id}/image   - Replace deal image (multipart)
DELETE /api/v1/admin/deals/{id}         - Delete deal
"""
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.deals import Deal

from app.security.permissions import require_admin
from app.services import audit_service
from app.schemas.deals import DealAdminOut, DealUpdate

router = APIRouter(tags=["Admin – Deals"])

UPLOAD_ROOT = Path(__file__).resolve().parents[3] / "static" / "uploads" / "deals"
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

ALLOWED_MIME = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


async def _upload_deal_image(file: UploadFile) -> str:
    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large ({len(contents) / (1024 * 1024):.1f} MB). Max allowed size is 5 MB.",
        )
    if not file.content_type or file.content_type.lower() not in ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format ({file.content_type}). Allowed: JPG, PNG, WebP.",
        )

    from app.services.cloudinary_service import upload_image_to_storage

    return upload_image_to_storage(
        file_bytes=contents,
        folder="deals",
        filename=file.filename,
        local_fallback_dir=UPLOAD_ROOT,
    )


@router.get("", response_model=list[DealAdminOut], summary="List all deals")
def list_deals(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Deal).order_by(Deal.display_order.asc(), Deal.created_at.desc()).all()


@router.post("", response_model=DealAdminOut, status_code=201, summary="Create a deal card (image required)")
async def create_deal(
    file: UploadFile = File(...),
    title: str = Form(default=""),
    subtitle: str = Form(default=""),
    link_url: str = Form(default=""),
    display_order: int = Form(default=1),
    is_active: bool = Form(default=True),
    bg_color: str = Form(default="#FF7000"),
    text_color: str = Form(default="#ffffff"),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    image_url = await _upload_deal_image(file)

    deal = Deal(
        image_url=image_url,
        title=title or None,
        subtitle=subtitle or None,
        link_url=link_url or None,
        display_order=display_order,
        is_active=is_active,
        bg_color=bg_color,
        text_color=text_color,
        updated_by=admin.id,
    )
    db.add(deal)
    db.commit()
    db.refresh(deal)
    audit_service.log_action(db, "DEAL_CREATED", admin.id, "deal", str(deal.id), {"title": deal.title})
    db.commit()
    return deal



@router.patch("/{deal_id}", response_model=DealAdminOut, summary="Update a deal's fields")
def update_deal(
    deal_id: int,
    data: DealUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(deal, field, value)
    deal.updated_by = admin.id
    db.commit()
    db.refresh(deal)
    return deal


@router.post("/{deal_id}/image", response_model=DealAdminOut, summary="Replace a deal's image")
async def replace_deal_image(
    deal_id: int,
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")

    deal.image_url = await _upload_deal_image(file)
    deal.updated_by = admin.id
    db.commit()
    db.refresh(deal)
    audit_service.log_action(db, "DEAL_IMAGE_UPDATED", admin.id, "deal", str(deal.id), {"filename": file.filename})
    db.commit()
    return deal


@router.delete("/{deal_id}", summary="Delete a deal")
def delete_deal(deal_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")
    db.delete(deal)
    db.commit()
    return {"success": True, "message": "Deal deleted."}