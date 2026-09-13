"""
JACRAL – Customer Review model.
Stores admin-managed customer reviews displayed on the homepage.
Only published and active reviews are visible to customers.
"""
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
    func,
    text,
)

from app.database import Base


class CustomerReview(Base):
    """
    Customer review displayed on the homepage Reviews section.
    Admin creates and publishes reviews; only published reviews are visible.
    """
    __tablename__ = "customer_reviews"

    id = Column(Integer, primary_key=True, index=True)

    # Review content
    customer_name = Column(String(150), nullable=False)
    customer_location = Column(String(100), nullable=True)  # e.g. "Mumbai"
    customer_image_url = Column(String(500), nullable=True)
    review_text = Column(Text, nullable=False)
    rating = Column(SmallInteger, nullable=False, default=5)  # 1–5

    # Optional product reference
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Display
    display_order = Column(Integer, nullable=False, default=1, server_default=text("1"))
    is_active = Column(Boolean, nullable=False, default=True, server_default=text("true"))
    is_published = Column(Boolean, nullable=False, default=False, server_default=text("false"))

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    created_by = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    updated_by = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
