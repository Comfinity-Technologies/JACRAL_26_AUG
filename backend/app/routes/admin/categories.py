"""
JACRAL – Admin: Category management.

POST   /api/v1/admin/categories       MANAGER+
GET    /api/v1/admin/categories        STAFF+
PATCH  /api/v1/admin/categories/{id}   MANAGER+
DELETE /api/v1/admin/categories/{id}   MANAGER+
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify

from app.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.security.permissions import require_admin
from app.services import audit_service

router = APIRouter(tags=["Admin – Categories"])


def _unique_slug(db: Session, name: str, exclude_id: int | None = None) -> str:
    base = slugify(name)
    slug = base
    counter = 1
    while True:
        q = db.query(Category).filter(Category.slug == slug)
        if exclude_id:
            q = q.filter(Category.id != exclude_id)
        if not q.first():
            return slug
        slug = f"{base}-{counter}"
        counter += 1


@router.get("", response_model=list[CategoryOut], summary="List all categories (admin)")
def list_categories(_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name).all()


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED, summary="Create category")
def create_category(data: CategoryCreate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    slug = _unique_slug(db, data.name)
    cat = Category(**data.model_dump(), slug=slug)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    audit_service.log_action(db, "CATEGORY_CREATED", admin.id, "category", str(cat.id), {"name": cat.name})
    db.commit()
    return cat


@router.patch("/{category_id}", response_model=CategoryOut, summary="Update category")
def update_category(
    category_id: int,
    data: CategoryUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found.")
    updates = data.model_dump(exclude_unset=True)
    if "name" in updates:
        updates["slug"] = _unique_slug(db, updates["name"], exclude_id=category_id)
    for field, value in updates.items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    audit_service.log_action(db, "CATEGORY_UPDATED", admin.id, "category", str(category_id))
    db.commit()
    return cat


@router.delete("/{category_id}", summary="Deactivate a category")
def delete_category(category_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found.")
    cat.is_active = False
    db.commit()
    db.refresh(cat)
    audit_service.log_action(db, "CATEGORY_DEACTIVATED", admin.id, "category", str(category_id))
    db.commit()
    return {"success": True, "message": "Category deactivated.", "id": category_id, "is_active": False}


@router.patch("/{category_id}/status", response_model=CategoryOut, summary="Toggle category active status")
def toggle_category_status(
    category_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Toggle a category between active and inactive."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found.")
    cat.is_active = not cat.is_active
    db.commit()
    db.refresh(cat)
    action = "CATEGORY_ACTIVATED" if cat.is_active else "CATEGORY_DEACTIVATED"
    audit_service.log_action(db, action, admin.id, "category", str(category_id))
    db.commit()
    return cat

