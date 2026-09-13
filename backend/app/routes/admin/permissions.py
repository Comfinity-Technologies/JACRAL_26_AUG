from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.role_permissions import RolePermission
from app.security.permissions import require_pro_admin

router = APIRouter(tags=["Admin – Permissions"])

class PermissionItem(BaseModel):
    role: str
    page: str
    can_access: bool

class PermissionResponse(PermissionItem):
    id: int

@router.get("", response_model=List[PermissionResponse], summary="List role permissions (PRO_ADMIN only)")
def get_permissions(db: Session = Depends(get_db), _admin: User = Depends(require_pro_admin)):
    permissions = db.query(RolePermission).all()
    return permissions

@router.put("", summary="Update role permissions (PRO_ADMIN only)")
def update_permissions(
    permissions_data: List[PermissionItem],
    db: Session = Depends(get_db),
    _admin: User = Depends(require_pro_admin),
):
    # Overwrite the existing permissions
    db.query(RolePermission).delete()
    db.commit()

    for item in permissions_data:
        perm = RolePermission(role=item.role, page=item.page, can_access=item.can_access)
        db.add(perm)

    db.commit()
    return {"success": True}
