"""
JACRAL – Policy API routes.
Public: GET /api/v1/policies, GET /api/v1/policies/{slug}
Admin:  POST, PATCH, DELETE
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.policy import Policy
from app.schemas.policy import PolicyCreate, PolicyOut, PolicyUpdate
from app.security.permissions import require_admin

router = APIRouter(tags=["Policies"])


# ──────────────────────────────
# PUBLIC endpoints
# ──────────────────────────────

@router.get("", response_model=List[PolicyOut])
@router.get("/", response_model=List[PolicyOut], include_in_schema=False)
def list_policies(db: Session = Depends(get_db)):
    """Return all active policies – consumed by the customer front-end."""
    return db.query(Policy).filter(Policy.is_active.is_(True)).all()


@router.get("/{slug}", response_model=PolicyOut)
def get_policy(slug: str, db: Session = Depends(get_db)):
    """Return a single policy by slug."""
    policy = db.query(Policy).filter(Policy.slug == slug, Policy.is_active.is_(True)).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


# ──────────────────────────────
# ADMIN endpoints
# ──────────────────────────────

@router.post("", response_model=PolicyOut, status_code=201,
             dependencies=[Depends(require_admin)])
@router.post("/", response_model=PolicyOut, status_code=201,
             dependencies=[Depends(require_admin)], include_in_schema=False)
def create_policy(payload: PolicyCreate, db: Session = Depends(get_db)):
    if db.query(Policy).filter(Policy.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")
    policy = Policy(**payload.dict())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.patch("/{slug}", response_model=PolicyOut,
              dependencies=[Depends(require_admin)])
def update_policy(slug: str, payload: PolicyUpdate, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.slug == slug).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(policy, field, value)
    db.commit()
    db.refresh(policy)
    return policy


@router.delete("/{slug}", status_code=204,
               dependencies=[Depends(require_admin)])
def delete_policy(slug: str, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.slug == slug).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    db.delete(policy)
    db.commit()
