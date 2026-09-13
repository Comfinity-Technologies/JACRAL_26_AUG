"""
JACRAL – Role-based permission dependencies.

Hierarchy: CUSTOMER < EMPLOYEE < ADMIN < SUPER_ADMIN < PRO_ADMIN

Usage in route:
    current_user: User = Depends(require_admin)
"""
from fastapi import Depends, HTTPException, status

from app.models.user import User
from app.security.dependencies import get_current_user

_ROLE_LEVEL = {
    "CUSTOMER": 0,
    "EMPLOYEE": 1,
    "ADMIN": 2,
    "SUPER_ADMIN": 3,
    "PRO_ADMIN": 4,
}


def _require_role(minimum_role: str):
    """Factory: returns a dependency that enforces a minimum role level."""

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        user_role = (current_user.role or "CUSTOMER").upper()
        user_level = _ROLE_LEVEL.get(user_role, 0)
        required_level = _ROLE_LEVEL.get(minimum_role.upper(), 0)

        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {minimum_role} or higher role.",
            )
        return current_user

    return dependency


# Convenience aliases
require_customer = _require_role("CUSTOMER")
require_employee = _require_role("EMPLOYEE")
require_admin = _require_role("ADMIN")
require_super_admin = _require_role("SUPER_ADMIN")
require_pro_admin = _require_role("PRO_ADMIN")
