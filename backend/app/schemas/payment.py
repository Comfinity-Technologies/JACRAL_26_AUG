"""
JACRAL – Payment schemas.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CheckoutRequest(BaseModel):
    order_id: int


class CheckoutResponse(BaseModel):
    """Returned to the frontend to initiate gateway payment."""
    payment_id: int
    provider: str
    provider_order_id: str
    amount: Decimal
    currency: str
    key_id: Optional[str] = None  # Razorpay publishable key


class RazorpayWebhookPayload(BaseModel):
    """Raw body is verified by signature; this is the parsed structure."""
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    provider: str
    provider_order_id: Optional[str] = None
    provider_payment_id: Optional[str] = None
    amount: Decimal
    currency: str
    status: str
    created_at: datetime
    updated_at: datetime
