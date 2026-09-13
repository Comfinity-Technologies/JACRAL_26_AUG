"""
JACRAL – Health check routes.
"""
import logging

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Health"])


@router.get("/health", summary="Basic health check")
def health():
    return {"status": "ok"}


@router.get("/health/db", summary="Database connectivity check")
def health_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        logger.error("DB health check failed: %s", exc)
        return {"status": "error", "database": "unreachable"}
