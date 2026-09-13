"""
JACRAL – Audit logging service.
"""
import json
import logging
import contextvars
from typing import Optional

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)

client_ip_var: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar("client_ip", default=None)

def log_action(
    db: Session,
    action: str,
    user_id: int | None = None,
    entity_type: str | None = None,
    entity_id: str | None = None,
    details: dict | None = None,
    ip_address: str | None = None,
) -> None:
    """
    Record an admin action in the audit_logs table.
    Silently swallows errors so audit failures don't disrupt business logic.
    """
    if ip_address is None:
        ip_address = client_ip_var.get()
        
    try:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            details=json.dumps(details) if details else None,
            ip_address=ip_address,
        )
        db.add(entry)
        db.flush()  # Participate in the caller's transaction
    except Exception as exc:
        logger.warning("Audit log write failed: %s", exc)
