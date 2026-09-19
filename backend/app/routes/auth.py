"""
JACRAL – Authentication routes.

POST /api/v1/auth/register                  PUBLIC
POST /api/v1/auth/login                     PUBLIC
GET  /api/v1/auth/me                        CUSTOMER
POST /api/v1/auth/refresh                   PUBLIC
POST /api/v1/auth/logout                    CUSTOMER
POST /api/v1/auth/admin/mfa/setup           ADMIN+
POST /api/v1/auth/admin/mfa/verify          ADMIN+
POST /api/v1/auth/admin/mfa/challenge       PUBLIC (MFA second factor)
POST /api/v1/auth/admin/mfa/recovery-code   PUBLIC (send email recovery code)
GET  /api/v1/auth/google/login              PUBLIC (redirect to Google)
GET  /api/v1/auth/google/callback           PUBLIC (OAuth callback)
"""
import logging
import secrets
import string

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
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
from app.config import settings
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Authentication"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _generate_recovery_code(length: int = 8) -> str:
    """Generate a random alphanumeric recovery code (uppercase)."""
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


# ---------------------------------------------------------------------------
# Standard auth
# ---------------------------------------------------------------------------

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
    return {"success": True, "message": "Logged out successfully."}


# ---------------------------------------------------------------------------
# MFA
# ---------------------------------------------------------------------------

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

    # img_b64 is already a full data URI: "data:image/png;base64,..."
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
    summary="Complete MFA challenge (TOTP or recovery code)",
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

    now = datetime.now(timezone.utc)

    # ── Try TOTP first ──────────────────────────────────────────────────────
    if data.code and verify_totp(user.mfa_secret, data.code):
        return TokenResponse(
            access_token=create_access_token(user.id, user.role),
            refresh_token=create_refresh_token(user.id),
            user=UserOut.model_validate(user),
        )

    # ── Try recovery code ───────────────────────────────────────────────────
    recovery_code = getattr(data, "recovery_code", None)
    if recovery_code and user.mfa_recovery_code_hash:
        if user.mfa_recovery_code_expires_at and user.mfa_recovery_code_expires_at < now:
            raise HTTPException(status_code=401, detail="Recovery code has expired. Request a new one.")
        if verify_password(recovery_code.upper().strip(), user.mfa_recovery_code_hash):
            # Single-use: invalidate immediately
            user.mfa_recovery_code_hash = None
            user.mfa_recovery_code_expires_at = None
            db.commit()
            return TokenResponse(
                access_token=create_access_token(user.id, user.role),
                refresh_token=create_refresh_token(user.id),
                user=UserOut.model_validate(user),
            )

    raise HTTPException(status_code=401, detail="Invalid verification code")


@router.post(
    "/admin/mfa/recovery-code",
    summary="Request an email recovery code (use when authenticator app is unavailable)",
)
@limiter.limit("3/hour")
def request_mfa_recovery_code(
    request: Request,
    data: MFAChallengeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Generates a time-limited (10 min), single-use recovery code and emails it
    to the account's registered email address.

    Rate-limited to 3 requests per hour per IP to prevent email bombing.
    The mfa_token from the login response is required to identify the user.
    """
    payload = decode_token(data.mfa_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired MFA token")

    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()

    if not user or not user.mfa_enabled:
        raise HTTPException(status_code=400, detail="Invalid MFA state")

    # Generate recovery code
    code = _generate_recovery_code()
    code_hash = hash_password(code)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    user.mfa_recovery_code_hash = code_hash
    user.mfa_recovery_code_expires_at = expires_at
    db.commit()

    # Send email (non-blocking)
    html = f"""
    <h2>JACRAL MFA Recovery Code</h2>
    <p>Your one-time MFA recovery code is:</p>
    <h1 style="letter-spacing: 0.2em; font-family: monospace; color: #3B6E4C;">{code}</h1>
    <p>This code expires in <strong>10 minutes</strong> and can only be used once.</p>
    <p>If you did not request this, please secure your account immediately.</p>
    """
    background_tasks.add_task(
        email_service.send_email,
        user.email,
        "JACRAL Admin – MFA Recovery Code",
        html,
    )

    return {
        "success": True,
        "message": f"A recovery code has been sent to {user.email}. It expires in 10 minutes.",
    }


# ---------------------------------------------------------------------------
# Google OAuth
# ---------------------------------------------------------------------------

@router.get(
    "/google/login",
    summary="Redirect to Google OAuth consent screen",
)
def google_login():
    """
    Redirects the browser to Google's OAuth2 consent page.
    After the user consents, Google redirects to /auth/google/callback.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured.")

    import urllib.parse
    params = urllib.parse.urlencode({
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    })
    return RedirectResponse(url=f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


@router.get(
    "/google/callback",
    summary="Google OAuth2 callback – exchange code for tokens",
)
def google_callback(code: str, db: Session = Depends(get_db)):
    """
    Exchanges the authorization code for an ID token, verifies it, and
    either finds an existing user or creates a new one.

    If the Google email already exists as a password account, the Google
    identity is linked to that account (no duplicate user created).
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured.")

    # Exchange code for tokens
    try:
        import httpx as _httpx
        token_resp = _httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        token_resp.raise_for_status()
        token_data = token_resp.json()
    except Exception as exc:
        logger.error("Google token exchange failed: %s", exc)
        raise HTTPException(status_code=400, detail="Failed to exchange Google authorization code.")

    # Verify ID token
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests
        id_token_str = token_data.get("id_token", "")
        id_info = google_id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception as exc:
        logger.error("Google ID token verification failed: %s", exc)
        raise HTTPException(status_code=400, detail="Google token verification failed.")

    email = id_info.get("email", "").strip().lower()
    name = id_info.get("name", "Google User")
    google_sub = id_info.get("sub", "")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email address.")

    # Find or create user
    user = db.query(User).filter(User.email == email).first()

    if user:
        # Link Google identity if not already linked
        if not user.oauth_provider:
            user.oauth_provider = "google"
            user.oauth_subject = google_sub
            db.commit()
    else:
        # Create new user (no password required for OAuth accounts)
        user = User(
            name=name,
            email=email,
            password_hash=hash_password(secrets.token_urlsafe(32)),  # Unusable random hash
            role="CUSTOMER",
            is_active=True,
            oauth_provider="google",
            oauth_subject=google_sub,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive.")

    # Issue JWT tokens and redirect frontend to a special callback URL
    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    # Redirect to frontend with tokens in query params
    # The frontend's /auth/google/success page should pick these up
    frontend_callback = (
        f"{settings.FRONTEND_URL}/auth/google/success"
        f"?access_token={access_token}"
        f"&refresh_token={refresh_token}"
    )
    return RedirectResponse(url=frontend_callback)