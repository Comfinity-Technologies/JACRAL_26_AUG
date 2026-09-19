"""
JACRAL – Admin Customer Reviews Routes.

GET    /api/v1/admin/reviews           List all reviews (draft + published)
POST   /api/v1/admin/reviews           Create a new review
PUT    /api/v1/admin/reviews/{id}      Update a review
DELETE /api/v1/admin/reviews/{id}      Delete a review
POST   /api/v1/admin/reviews/{id}/publish   Publish a review
POST   /api/v1/admin/reviews/{id}/unpublish Unpublish a review
"""
import os
from typing import List

import requests
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.review import CustomerReview
from app.models.user import User
from app.schemas.review import FetchGoogleReviews, ReviewAdminOut, ReviewCreate, ReviewUpdate
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


@router.post("/fetch-google", summary="Fetch Google Reviews via Places API")
def fetch_google_reviews(
    data: FetchGoogleReviews,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    place_id = data.place_id
    api_key = data.api_key or os.environ.get("GOOGLE_PLACES_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Google Places API Key is required (either in payload or GOOGLE_PLACES_API_KEY env var).",
        )

    # 1. Fetch place details (reviews)
    url = f"https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "reviews",
        "key": api_key,
        "language": "en"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        result = response.json()
        
        if result.get("status") != "OK":
            raise HTTPException(
                status_code=400,
                detail=f"Google API Error: {result.get('status')} - {result.get('error_message', '')}"
            )
            
        reviews_data = result.get("result", {}).get("reviews", [])
        
        added_count = 0
        for r in reviews_data:
            # check if review already exists loosely based on author and text
            existing = db.query(CustomerReview).filter(
                CustomerReview.customer_name == r.get("author_name"),
                CustomerReview.rating == r.get("rating")
            ).first()
            
            if not existing:
                new_review = CustomerReview(
                    customer_name=r.get("author_name"),
                    customer_image_url=r.get("profile_photo_url"),
                    review_text=r.get("text", "")[:500],
                    rating=r.get("rating", 5),
                    is_active=True,
                    is_published=False,  # Draft by default
                    created_by=admin.id,
                    updated_by=admin.id,
                )
                db.add(new_review)
                added_count += 1
                
        if added_count > 0:
            db.commit()
            audit_service.log_action(db, "GOOGLE_REVIEWS_FETCHED", admin.id, "customer_review", "", {"added": added_count})
            
        return {"success": True, "message": f"Successfully fetched and added {added_count} new reviews as drafts.", "added": added_count}
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch from Google API: {str(e)}")
