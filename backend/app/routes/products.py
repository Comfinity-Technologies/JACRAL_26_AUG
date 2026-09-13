"""
JACRAL – Public product routes.

GET /api/v1/products               PUBLIC (search, filter, paginate)
GET /api/v1/products/{id}          PUBLIC
GET /api/v1/products/slug/{slug}   PUBLIC
"""
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductOut
from app.utils.pagination import PaginatedResponse, PaginationParams

router = APIRouter(tags=["Products"])


@router.get(
    "",
    summary="List active products with search, filter, and pagination",
)
def list_products(
    search: Optional[str] = Query(default=None, description="Search name/description"),
    category_id: Optional[int] = Query(default=None),
    min_price: Optional[Decimal] = Query(default=None, ge=0),
    max_price: Optional[Decimal] = Query(default=None, ge=0),
    featured: Optional[bool] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    sort: str = Query(default="created_at_desc"),
    db: Session = Depends(get_db),
):
    pagination = PaginationParams(page=page, limit=limit)

    q = db.query(Product).filter(Product.is_active.is_(True))

    if search:
        term = f"%{search.lower()}%"
        q = q.filter(
            (Product.name.ilike(term)) | (Product.description.ilike(term))
        )

    if category_id is not None:
        q = q.filter(Product.category_id == category_id)

    if min_price is not None:
        q = q.filter(Product.price >= min_price)

    if max_price is not None:
        q = q.filter(Product.price <= max_price)

    if featured is not None:
        q = q.filter(Product.featured.is_(featured))

    # Sorting
    sort_map = {
        "price_asc": Product.price.asc(),
        "price_desc": Product.price.desc(),
        "name_asc": Product.name.asc(),
        "created_at_desc": Product.created_at.desc(),
        "created_at_asc": Product.created_at.asc(),
    }
    q = q.order_by(sort_map.get(sort, Product.created_at.desc()))

    total = q.count()
    items = q.offset(pagination.offset).limit(pagination.limit).all()

    return PaginatedResponse.build(
        items=[ProductOut.model_validate(p) for p in items],
        total=total,
        pagination=pagination,
    )


@router.get(
    "/slug/{slug}",
    response_model=ProductOut,
    summary="Get product by slug",
)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .filter(Product.slug == slug, Product.is_active.is_(True))
        .first()
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product


@router.get(
    "/{product_id}",
    response_model=ProductOut,
    summary="Get product by ID",
)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.is_active.is_(True))
        .first()
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product