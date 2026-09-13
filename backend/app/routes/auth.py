"""
JACRAL – Authentication routes.

POST /api/v1/auth/register    PUBLIC
POST /api/v1/auth/login       PUBLIC
GET  /api/v1/auth/me          CUSTOMER
POST /api/v1/auth/refresh     PUBLIC
POST /api/v1/auth/logout      CUSTOMER
"""
import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
    MFASetupResponse,
    MFAVerifyRequest,
    MFAChallengeRequest,
)
from app.security.dependencies import get_current_user
from app.security.jwt import create_access_token, create_refresh_token, decode_token
from app.security.password import hash_password, verify_password
from app.security.mfa import generate_mfa_secret, get_totp_uri, generate_qr_code_base64, verify_totp
from app.services import email_service
from datetime import datetime, timezone

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new customer account",
)
@limiter.limit("5/minute")
def register(request: Request, data: RegisterRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
        role="CUSTOMER",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Non-blocking welcome email
    email_service.send_registration_confirmation(background_tasks, user.email, user.name)

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive JWT tokens",
)
@limiter.limit("10/minute")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    _invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not user or not verify_password(data.password, user.password_hash):
        raise _invalid

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    if user.mfa_enabled and user.role in ["ADMIN", "SUPER_ADMIN"]:
        mfa_token = create_access_token(user.id, user.role)
        return TokenResponse(
            mfa_required=True,
            mfa_token=mfa_token
        )

    return TokenResponse(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get the currently authenticated user",
)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Exchange a refresh token for new access + refresh tokens",
)
def refresh_tokens(data: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.refresh_token)

    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )

    user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
        )

    return TokenResponse(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.post(
    "/logout",
    summary="Logout – client should discard tokens",
)
def logout(current_user: User = Depends(get_current_user)):
    # Stateless JWT: instruct client to discard tokens.
    # For full token revocation, implement a token blacklist (Redis/DB).
    return {"success": True, "message": "Logged out successfully."}

@router.post(
    "/admin/mfa/setup",
    response_model=MFASetupResponse,
    summary="Setup MFA (TOTP) for Admin/SuperAdmin",
)
def setup_mfa(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if current_user.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA already enabled")
        
    secret = generate_mfa_secret()
    current_user.mfa_secret = secret
    db.commit()
    
    uri = get_totp_uri(secret, current_user.email)
    img_b64 = generate_qr_code_base64(uri)
    
    return {"secret": secret, "uri": uri, "qr_code_svg": "", "qr_code_image": img_b64}

@router.post(
    "/admin/mfa/verify",
    summary="Verify and enable MFA",
)
def verify_mfa(data: MFAVerifyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if not current_user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA not setup")
        
    if verify_totp(current_user.mfa_secret, data.code):
        current_user.mfa_enabled = True
        current_user.mfa_verified_at = datetime.now(timezone.utc)
        db.commit()
        return {"success": True, "message": "MFA enabled successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid verification code")

@router.post(
    "/admin/mfa/challenge",
    response_model=TokenResponse,
    summary="Complete MFA challenge to receive tokens",
)
@limiter.limit("5/minute")
def challenge_mfa(request: Request, data: MFAChallengeRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.mfa_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired MFA token")
        
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.mfa_enabled or not user.mfa_secret:
        raise HTTPException(status_code=400, detail="Invalid MFA state")
        
    if verify_totp(user.mfa_secret, data.code):
        return TokenResponse(
            access_token=create_access_token(user.id, user.role),
            refresh_token=create_refresh_token(user.id),
            user=UserOut.model_validate(user),
        )
    else:
        raise HTTPException(status_code=401, detail="Invalid verification code")