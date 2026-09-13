"""
JACRAL – How To Use Steps Model.
Stores admin-managed steps for the 'How To Use' section on the homepage.
"""
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func, text

from app.database import Base


class HowToUseStep(Base):
    __tablename__ = "how_to_use_steps"

    id = Column(Integer, primary_key=True, index=True)
    step_number = Column(Integer, nullable=False)  # 1, 2, 3, 4
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    sort_order = Column(Integer, nullable=False, default=1, server_default=text("1"))
    is_active = Column(Boolean, nullable=False, default=True, server_default=text("true"))

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
