"""
JACRAL – Admin: Product management.

POST   /api/v1/admin/products              ADMIN+
GET    /api/v1/admin/products              EMPLOYEE+
PATCH  /api/v1/admin/products/{id}         ADMIN+
DELETE /api/v1/admin/products/{id}         ADMIN+
PATCH  /api/v1/admin/products/{id}/status  ADMIN+
POST   /api/v1/admin/products/{id}/image   ADMIN+  ← image upload
"""
import os
import uuid
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session
from slugify import slugify

from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductOut, ProductStatusUpdate, ProductUpdate
from app.security.permissions import require_admin, require_employee
from app.services import audit_service
from app.utils.pagination import PaginatedResponse, PaginationParams

router = APIRouter(tags=["Admin – Products"])

# Directory for uploaded product images – relative to backend root
UPLOAD_DIR = Path(__file__).resolve().parents[3] / "static" / "products"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _unique_slug(db: Session, name: str, exclude_id: int | None = None) -> str:
    base = slugify(name)
    slug = base
    counter = 1
    while True:
        q = db.query(Product).filter(Product.slug == slug)
        if exclude_id:
            q = q.filter(Product.id != exclude_id)
        if not q.first():
            return slug
        slug = f"{base}-{counter}"
        counter += 1


@router.get("", summary="List all products (admin)")
def list_products_admin(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: str = Query(default=None),
    category_id: int = Query(default=None),
    is_active: bool = Query(default=None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_employee),
):
    pagination = PaginationParams(page=page, limit=limit)
    q = db.query(Product)
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))
    if category_id is not None:
        q = q.filter(Product.category_id == category_id)
    if is_active is not None:
        q = q.filter(Product.is_active.is_(is_active))
    total = q.count()
    items = q.order_by(Product.created_at.desc()).offset(pagination.offset).limit(pagination.limit).all()
    return PaginatedResponse.build(items=[ProductOut.model_validate(p) for p in items], total=total, pagination=pagination)


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED, summary="Create a product")
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    slug = _unique_slug(db, data.name)
    product = Product(**data.model_dump(), slug=slug, created_by=admin.id, updated_by=admin.id)
    db.add(product)
    db.commit()
    db.refresh(product)
    audit_service.log_action(db, "PRODUCT_CREATED", admin.id, "product", str(product.id), {"name": product.name})
    db.commit()
    return product


@router.patch("/{product_id}", response_model=ProductOut, summary="Update a product")
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    updates = data.model_dump(exclude_unset=True)
    if "name" in updates:
        updates["slug"] = _unique_slug(db, updates["name"], exclude_id=product_id)
    updates["updated_by"] = admin.id
    for field, value in updates.items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    audit_service.log_action(db, "PRODUCT_UPDATED", admin.id, "product", str(product_id))
    db.commit()
    return product


@router.patch("/{product_id}/status", response_model=ProductOut, summary="Toggle product active status")
def update_product_status(
    product_id: int,
    data: ProductStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    product.is_active = data.is_active
    product.updated_by = admin.id
    db.commit()
    db.refresh(product)
    audit_service.log_action(db, "PRODUCT_STATUS_CHANGED", admin.id, "product", str(product_id), {"is_active": data.is_active})
    db.commit()
    return product


@router.post("/{product_id}/image", response_model=ProductOut, summary="Upload product image")
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    slot: str = Query(default="primary", pattern="^(primary|hover)$"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Accept a JPEG/PNG/WebP image (max 5 MB) and store it under /static/products/ for primary or hover slot."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: JPEG, PNG, WebP, GIF.",
        )

    # Read content and check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max allowed size is 5 MB.")

    from app.services.cloudinary_service import upload_image_to_storage

    image_url = upload_image_to_storage(
        file_bytes=contents,
        folder="products",
        filename=file.filename,
        local_fallback_dir=UPLOAD_DIR,
    )

    if slot == "primary":
        product.image_url = image_url
    else:
        product.hover_image_url = image_url

    product.updated_by = admin.id
    db.commit()
    db.refresh(product)
    audit_service.log_action(db, "PRODUCT_IMAGE_UPLOADED", admin.id, "product", str(product_id), {"filename": file.filename, "slot": slot})
    db.commit()
    return product


@router.delete("/{product_id}", summary="Soft-delete a product")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    product.is_active = False
    product.updated_by = admin.id
    db.commit()
    audit_service.log_action(db, "PRODUCT_DELETED", admin.id, "product", str(product_id))
    db.commit()
    return {"success": True, "message": "Product deactivated."}
