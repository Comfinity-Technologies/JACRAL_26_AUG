"""
JACRAL – Address routes.

GET    /api/v1/addresses       CUSTOMER
POST   /api/v1/addresses       CUSTOMER
PATCH  /api/v1/addresses/{id}  CUSTOMER
DELETE /api/v1/addresses/{id}  CUSTOMER
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressCreate, AddressOut, AddressUpdate
from app.security.permissions import require_customer

router = APIRouter(tags=["Addresses"])


def _assert_owns(address, user):
    if not address or address.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found.")


@router.get("/", response_model=list[AddressOut], summary="List customer addresses")
def list_addresses(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return (
        db.query(Address)
        .filter(Address.user_id == current_user.id)
        .order_by(Address.is_default.desc(), Address.created_at.desc())
        .all()
    )


@router.post("/", response_model=AddressOut, status_code=status.HTTP_201_CREATED, summary="Add address")
def create_address(data: AddressCreate, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    if data.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
    address = Address(**data.model_dump(), user_id=current_user.id)
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.patch("/{address_id}", response_model=AddressOut, summary="Update address")
def update_address(address_id: int, data: AddressUpdate, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    address = db.query(Address).filter(Address.id == address_id).first()
    _assert_owns(address, current_user)
    if data.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(address, field, value)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/{address_id}", summary="Delete address")
def delete_address(address_id: int, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    address = db.query(Address).filter(Address.id == address_id).first()
    _assert_owns(address, current_user)
    db.delete(address)
    db.commit()
    return {"success": True, "message": "Address deleted."}
