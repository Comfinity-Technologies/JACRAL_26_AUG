"""
JACRAL – Admin: User management.

GET    /api/v1/admin/users                    ADMIN+ (customers only) | SUPER_ADMIN (all)
GET    /api/v1/admin/users/customers          ADMIN+   — customers list
GET    /api/v1/admin/users/staff              SUPER_ADMIN — internal team list
GET    /api/v1/admin/users/{id}              SUPER_ADMIN
POST   /api/v1/admin/users                   SUPER_ADMIN — create staff account
PATCH  /api/v1/admin/users/{id}              SUPER_ADMIN
PATCH  /api/v1/admin/users/{id}/status       SUPER_ADMIN
PATCH  /api/v1/admin/users/{id}/role         SUPER_ADMIN
DELETE /api/v1/admin/users/{id}              SUPER_ADMIN
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserRoleUpdate, UserStatusUpdate, UserUpdate, UserCreate
from app.security.password import hash_password
from app.security.permissions import require_admin, require_super_admin
from app.services import audit_service
from app.utils.pagination import PaginatedResponse, PaginationParams

router = APIRouter(tags=["Admin – Users"])

STAFF_ROLES = {"EMPLOYEE", "ADMIN", "SUPER_ADMIN", "PRO_ADMIN"}
CUSTOMER_ROLES = {"CUSTOMER", "customer"}


# ─── Customer list (ADMIN+) ───────────────────────────────────────────────────

@router.get("/customers", response_model=PaginatedResponse[UserOut], summary="List customer accounts (ADMIN+)")
def list_customers(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: str = Query(default=None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    pagination = PaginationParams(page=page, limit=limit)
    q = db.query(User).filter(User.role.in_(["CUSTOMER", "customer"]))
    if search:
        q = q.filter(
            User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%")
        )
    total = q.count()
    items = q.order_by(User.created_at.desc()).offset(pagination.offset).limit(pagination.limit).all()
    return PaginatedResponse.build(
        items=[UserOut.model_validate(u) for u in items],
        total=total,
        pagination=pagination,
    )


# ─── Staff / team list (SUPER_ADMIN) ─────────────────────────────────────────

@router.get("/staff", response_model=PaginatedResponse[UserOut], summary="List internal staff accounts (SUPER_ADMIN)")
def list_staff(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    role: str = Query(default=None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_super_admin),
):
    pagination = PaginationParams(page=page, limit=limit)
    q = db.query(User).filter(User.role.in_(list(STAFF_ROLES)))
    if role:
        q = q.filter(User.role == role)
    total = q.count()
    items = q.order_by(User.created_at.desc()).offset(pagination.offset).limit(pagination.limit).all()
    return PaginatedResponse.build(
        items=[UserOut.model_validate(u) for u in items],
        total=total,
        pagination=pagination,
    )


# ─── General list (backward-compat; SUPER_ADMIN = all, ADMIN = customers) ────

@router.get("", response_model=PaginatedResponse[UserOut], summary="List users (role-filtered)")
def list_users(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    role: str = Query(default=None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    pagination = PaginationParams(page=page, limit=limit)
    q = db.query(User)

    # ADMIN can only see customers; SUPER_ADMIN+ can see everyone
    if current_admin.role == "ADMIN":
        q = q.filter(User.role.in_(["CUSTOMER", "customer"]))
    elif role:
        q = q.filter(User.role == role)

    total = q.count()
    items = q.order_by(User.created_at.desc()).offset(pagination.offset).limit(pagination.limit).all()
    return PaginatedResponse.build(
        items=[UserOut.model_validate(u) for u in items],
        total=total,
        pagination=pagination,
    )


# ─── Create staff account (SUPER_ADMIN) ──────────────────────────────────────

@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED, summary="Create new staff/admin account")
def create_staff_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    email = data.email.strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered.",
        )
    try:
        pw_hash = hash_password(data.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    user = User(
        name=data.name.strip(),
        email=email,
        phone=data.phone,
        password_hash=pw_hash,
        role=data.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    audit_service.log_action(db, "USER_CREATED", admin.id, "user", str(user.id), {"role": user.role})
    db.commit()
    return user


# ─── Get single user ──────────────────────────────────────────────────────────

@router.get("/{user_id}", response_model=UserOut, summary="Get a user")
def get_user(user_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_super_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


# ─── Update profile ───────────────────────────────────────────────────────────

@router.patch("/{user_id}", response_model=UserOut, summary="Update user profile")
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    audit_service.log_action(db, "USER_UPDATED", admin.id, "user", str(user_id))
    db.commit()
    return user


# ─── Toggle active status ─────────────────────────────────────────────────────

@router.patch("/{user_id}/status", response_model=UserOut, summary="Activate or deactivate a user")
def update_user_status(
    user_id: int,
    data: UserStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own status.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_active = data.is_active
    db.commit()
    db.refresh(user)
    action = "USER_ACTIVATED" if data.is_active else "USER_DEACTIVATED"
    audit_service.log_action(db, action, admin.id, "user", str(user_id))
    db.commit()
    return user


# ─── Change role ──────────────────────────────────────────────────────────────

@router.patch("/{user_id}/role", response_model=UserOut, summary="Change a user's role")
def update_user_role(
    user_id: int,
    data: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.role = data.role
    db.commit()
    db.refresh(user)
    audit_service.log_action(db, "USER_ROLE_CHANGED", admin.id, "user", str(user_id), {"new_role": data.role})
    db.commit()
    return user


# ─── Soft-delete ──────────────────────────────────────────────────────────────

@router.delete("/{user_id}", summary="Deactivate (soft-delete) a user")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_active = False
    db.commit()
    audit_service.log_action(db, "USER_DEACTIVATED", admin.id, "user", str(user_id))
    db.commit()
    return {"success": True, "message": "User deactivated."}
