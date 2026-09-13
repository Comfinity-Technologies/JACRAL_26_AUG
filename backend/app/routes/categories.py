"""
JACRAL – Public category routes.
GET /api/v1/categories              PUBLIC
GET /api/v1/categories/{id}/products  PUBLIC
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryOut
from app.schemas.product import ProductOut

router = APIRouter(tags=["Categories"])


@router.get(
    "",
    response_model=list[CategoryOut],
    summary="List all active categories",
)
def list_categories(db: Session = Depends(get_db)):
    return (
        db.query(Category)
        .filter(Category.is_active.is_(True))
        .order_by(Category.name)
        .all()
    )


@router.get(
    "/{category_id}/products",
    response_model=list[ProductOut],
    summary="List active products in a category",
)
def list_category_products(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(
        Category.id == category_id, Category.is_active.is_(True)
    ).first()

    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    return (
        db.query(Product)
        .filter(Product.category_id == category_id, Product.is_active.is_(True))
        .order_by(Product.name)
        .all()
    )
