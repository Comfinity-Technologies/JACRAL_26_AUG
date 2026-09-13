"""
JACRAL – FastAPI dependency functions for authentication.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.security.jwt import decode_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

_credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials.",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve JWT to a User. Raises 401 if invalid or user inactive."""
    payload = decode_token(token)

    if payload is None or payload.get("type") != "access":
        raise _credentials_exception

    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise _credentials_exception

    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise _credentials_exception

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise _credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    return user


def get_optional_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    """Like get_current_user but returns None instead of raising for missing tokens."""
    try:
        return get_current_user(token=token, db=db)
    except HTTPException:
        return None
