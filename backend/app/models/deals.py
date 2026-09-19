"""
JACRAL – Deal card model.
Admin-uploaded promo/deal images shown in a row above the Shop page products,
Amazon-style: a single centered card when there's one, sliding cards when there
are several.
"""
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String

from app.database import Base


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(500), nullable=False)
    title = Column(String(120), nullable=True)       # e.g. "Starting ₹149"
    subtitle = Column(String(160), nullable=True)     # e.g. "Monsoon home essentials"
    link_url = Column(String(500), nullable=True)     # optional click-through, e.g. /shop?category=...
    display_order = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, default=True, nullable=False)
    bg_color = Column(String(20), nullable=True, default="#FF7000")   # card background colour
    text_color = Column(String(20), nullable=True, default="#ffffff")  # card text colour

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)