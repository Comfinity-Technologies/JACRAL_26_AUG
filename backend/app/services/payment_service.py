"""
JACRAL – Payment service.
Abstracts Razorpay (and future Cashfree) behind a common interface.
"""
import hashlib
import hmac
import json
import logging
from decimal import Decimal
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# Razorpay
# ------------------------------------------------------------------

def _razorpay_client():
    """Return a Razorpay client. Raises if not configured."""
    if not settings.razorpay_configured:
        raise RuntimeError("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.")

    try:
        import razorpay  # type: ignore
        return razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
    except ImportError:
        raise RuntimeError(
            "razorpay package not installed. Run: pip install razorpay"
        )


def create_razorpay_order(amount_inr: Decimal, order_id: int) -> dict:
    """
    Create a Razorpay payment order.
    Amount is in INR – converted to paise (×100) for Razorpay.
    """
    client = _razorpay_client()
    amount_paise = int(amount_inr * 100)

    razorpay_order = client.order.create(
        {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"jacral_order_{order_id}",
            "payment_capture": 1,
        }
    )
    return razorpay_order


def verify_razorpay_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> bool:
    """
    Verify Razorpay payment signature.
    Returns True if valid.
    """
    if not settings.RAZORPAY_KEY_SECRET:
        logger.error("RAZORPAY_KEY_SECRET not set – cannot verify signature")
        return False

    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, razorpay_signature)


def verify_razorpay_webhook_signature(body: bytes, received_signature: str) -> bool:
    """
    Verify incoming Razorpay webhook signature.
    """
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        logger.error("RAZORPAY_WEBHOOK_SECRET not set – cannot verify webhook")
        return False

    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        body,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, received_signature)


# ------------------------------------------------------------------
# Provider-agnostic interface
# ------------------------------------------------------------------

def create_payment_order(amount: Decimal, order_id: int) -> dict:
    """Create a gateway payment order based on configured provider."""
    provider = settings.PAYMENT_PROVIDER.lower()

    if provider == "razorpay":
        rz_order = create_razorpay_order(amount, order_id)
        return {
            "provider": "razorpay",
            "provider_order_id": rz_order["id"],
            "amount": amount,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
        }

    raise NotImplementedError(f"Payment provider '{provider}' is not supported yet.")
