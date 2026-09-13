"""
JACRAL – UTM Visit model.
Anonymous source tracking for marketing campaigns.
"""
from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UtmVisit(Base):
    __tablename__ = "utm_visits"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    utm_source: Mapped[str | None] = mapped_column(
        String(100), nullable=True, index=True
    )

    utm_medium: Mapped[str | None] = mapped_column(String(100), nullable=True)

    utm_campaign: Mapped[str | None] = mapped_column(
        String(150), nullable=True, index=True
    )

    utm_term: Mapped[str | None] = mapped_column(String(150), nullable=True)

    utm_content: Mapped[str | None] = mapped_column(String(150), nullable=True)

    landing_page: Mapped[str | None] = mapped_column(Text, nullable=True)

    referrer: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Anonymous browser session – not linked to a user
    session_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    visited_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
