"""
JACRAL – Payment model.
Stores payment gateway records per order.
"""
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="RESTRICT"),
        nullable=False,
        unique=True,
        index=True,
    )

    provider: Mapped[str] = mapped_column(String(30), nullable=False)

    # Gateway-generated order/session ID (created before payment)
    provider_order_id: Mapped[str | None] = mapped_column(
        String(150), nullable=True, index=True
    )

    # Gateway-generated payment ID (populated after success)
    provider_payment_id: Mapped[str | None] = mapped_column(
        String(150), nullable=True, unique=True, index=True
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)

    # created | pending | paid | failed | refunded
    status: Mapped[str] = mapped_column(
        String(30), default="created", nullable=False, index=True
    )

    # Razorpay signature for webhook verification
    signature: Mapped[str | None] = mapped_column(Text, nullable=True)

    raw_response: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    order = relationship("Order", back_populates="payment")
