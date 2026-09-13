"""
JACRAL – Admin Customer Reviews Routes.

GET    /api/v1/admin/reviews           List all reviews (draft + published)
POST   /api/v1/admin/reviews           Create a new review
PUT    /api/v1/admin/reviews/{id}      Update a review
DELETE /api/v1/admin/reviews/{id}      Delete a review
POST   /api/v1/admin/reviews/{id}/publish   Publish a review
POST   /api/v1/admin/reviews/{id}/unpublish Unpublish a review
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.review import CustomerReview
from app.models.user import User
from app.schemas.review import ReviewAdminOut, ReviewCreate, ReviewUpdate
from app.security.permissions import require_admin, require_employee
from app.services import audit_service

router = APIRouter(tags=["Admin – Reviews"])


@router.get("", response_model=List[ReviewAdminOut], summary="List all customer reviews")
def list_reviews(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_employee),
):
    reviews = (
        db.query(CustomerReview)
        .order_by(CustomerReview.display_order.asc(), CustomerReview.created_at.desc())
        .all()
    )
    return reviews


@router.post(
    "",
    response_model=ReviewAdminOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer review",
)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    review = CustomerReview(
        customer_name=data.customer_name,
        customer_location=data.customer_location,
        customer_image_url=data.customer_image_url,
        review_text=data.review_text,
        rating=data.rating,
        product_id=data.product_id,
        display_order=data.display_order,
        is_active=data.is_active,
        is_published=data.is_published,
        created_by=admin.id,
        updated_by=admin.id,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    audit_service.log_action(db, "REVIEW_CREATED", admin.id, "customer_review", str(review.id))
    db.commit()
    return review


@router.put("/{review_id}", response_model=ReviewAdminOut, summary="Update a customer review")
def update_review(
    review_id: int,
    data: ReviewUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    review = db.query(CustomerReview).filter(CustomerReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(review, field, val)
    review.updated_by = admin.id

    db.commit()
    db.refresh(review)
    audit_service.log_action(db, "REVIEW_UPDATED", admin.id, "customer_review", str(review_id))
    db.commit()
    return review


@router.delete("/{review_id}", summary="Delete a customer review")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    review = db.query(CustomerReview).filter(CustomerReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    db.delete(review)
    db.commit()
    audit_service.log_action(db, "REVIEW_DELETED", admin.id, "customer_review", str(review_id))
    db.commit()
    return {"success": True, "message": "Review deleted successfully"}


@router.post("/{review_id}/publish", response_model=ReviewAdminOut, summary="Publish a review")
def publish_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    review = db.query(CustomerReview).filter(CustomerReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.is_published = True
    review.is_active = True
    review.updated_by = admin.id
    db.commit()
    db.refresh(review)
    audit_service.log_action(db, "REVIEW_PUBLISHED", admin.id, "customer_review", str(review_id))
    db.commit()
    return review


@router.post("/{review_id}/unpublish", response_model=ReviewAdminOut, summary="Unpublish a review")
def unpublish_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    review = db.query(CustomerReview).filter(CustomerReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.is_published = False
    review.updated_by = admin.id
    db.commit()
    db.refresh(review)
    audit_service.log_action(db, "REVIEW_UNPUBLISHED", admin.id, "customer_review", str(review_id))
    db.commit()
    return review


from fastapi import File, UploadFile

@router.post("/{review_id}/image", response_model=ReviewAdminOut, summary="Upload review image")
async def upload_review_image(
    review_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    review = db.query(CustomerReview).filter(CustomerReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max allowed size is 5 MB.")

    from app.services.cloudinary_service import upload_image_to_storage
    image_url = upload_image_to_storage(
        file_bytes=contents,
        folder="reviews",
        filename=file.filename,
    )

    review.customer_image_url = image_url
    review.updated_by = admin.id
    db.commit()
    db.refresh(review)
    audit_service.log_action(db, "REVIEW_IMAGE_UPLOADED", admin.id, "customer_review", str(review_id))
    db.commit()
    return review
