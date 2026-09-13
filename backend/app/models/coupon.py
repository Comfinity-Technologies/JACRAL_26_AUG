"""
JACRAL – Coupon model.
Discount codes supporting percentage and fixed-amount discounts.
"""
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Coupon(Base):
    __tablename__ = "coupons"
    __table_args__ = (
        CheckConstraint(
            "discount_value > 0", name="ck_coupon_discount_positive"
        ),
        CheckConstraint(
            "usage_limit IS NULL OR usage_limit > 0",
            name="ck_coupon_usage_limit",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    code: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # percentage | fixed
    discount_type: Mapped[str] = mapped_column(String(20), nullable=False)

    discount_value: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    minimum_order_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=Decimal("0.00"), nullable=False
    )

    maximum_discount: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )

    usage_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)

    used_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    starts_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
