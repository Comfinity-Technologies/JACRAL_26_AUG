"""
JACRAL – Policy model.
Stores the four static site policies in the database.
"""
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from app.database import Base


class Policy(Base):
    """SQL table for site-wide policies (Privacy, Terms, Shipping, Return)."""

    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(120), nullable=False)
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
