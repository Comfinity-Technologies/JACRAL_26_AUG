"""
JACRAL – Shipping service abstraction (Shiprocket).
Gracefully degrades if credentials are not configured.
"""
import logging
import time
import asyncio
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_SHIPROCKET_AUTH_URL = "https://apiv2.shiprocket.in/v1/external/auth/login"
_SHIPROCKET_ORDER_URL = "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc"
_SHIPROCKET_TRACK_URL = "https://apiv2.shiprocket.in/v1/external/courier/track/shipment/{}"

_token_cache: dict = {}


async def _get_token() -> Optional[str]:
    """Authenticate with Shiprocket and cache the token."""
    if not settings.shiprocket_configured:
        return None

    cached = _token_cache.get("token")
    expires_at = _token_cache.get("expires_at", 0)
    
    if cached and time.time() < expires_at:
        return cached

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                _SHIPROCKET_AUTH_URL,
                json={
                    "email": settings.SHIPROCKET_EMAIL,
                    "password": settings.SHIPROCKET_PASSWORD,
                },
                timeout=10,
            )
            resp.raise_for_status()
            token = resp.json().get("token")
            _token_cache["token"] = token
            # Cache for 8 days (Shiprocket tokens usually last 9-10 days)
            _token_cache["expires_at"] = time.time() + (8 * 24 * 60 * 60)
            return token
    except Exception as exc:
        logger.error("Shiprocket auth failed: %s", exc)
        return None


async def create_shipment(order_data: dict) -> Optional[dict]:
    """
    Create a Shiprocket shipment.
    Returns the Shiprocket response or None if not configured/failed.
    """
    if not settings.shiprocket_configured:
        logger.warning("Shiprocket not configured – skipping shipment creation")
        return None

    token = await _get_token()
    if not token:
        return None

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                _SHIPROCKET_ORDER_URL,
                json=order_data,
                headers={"Authorization": f"Bearer {token}"},
                timeout=15,
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        logger.error("Shiprocket create_shipment failed: %s", exc)
        return None


async def get_tracking(shipment_id: str) -> Optional[dict]:
    """Return tracking info for a shipment."""
    if not settings.shiprocket_configured:
        return None

    token = await _get_token()
    if not token:
        return None

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                _SHIPROCKET_TRACK_URL.format(shipment_id),
                headers={"Authorization": f"Bearer {token}"},
                timeout=10,
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        logger.error("Shiprocket tracking failed for %s: %s", shipment_id, exc)
        return None

def create_shipment_background(order_id: int) -> None:
    """Synchronous wrapper to run create_shipment in a background task."""
    try:
        from app.database import SessionLocal
        from app.models.order import Order
        db = SessionLocal()
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            db.close()
            return

        order_data = {
            "order_id": str(order.id),
            "order_date": order.created_at.strftime("%Y-%m-%d"),
            "pickup_location": "Primary",
            "billing_customer_name": order.shipping_name,
            "billing_last_name": "",
            "billing_address": order.shipping_address,
            "billing_city": "Default City",
            "billing_pincode": "110001",
            "billing_state": "Default State",
            "billing_country": "India",
            "billing_email": order.shipping_email,
            "billing_phone": order.shipping_phone,
            "shipping_is_billing": True,
            "order_items": [{"name": f"Order {order.id} Items", "sku": "default", "units": 1, "selling_price": float(order.total_amount)}],
            "payment_method": "Prepaid" if order.payment_status == "paid" else "COD",
            "sub_total": float(order.total_amount),
            "length": 10,
            "breadth": 10,
            "height": 10,
            "weight": 1
        }
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        resp = loop.run_until_complete(create_shipment(order_data))
        loop.close()
        
        if resp and resp.get("shipment_id"):
            order.shipment_id = str(resp.get("shipment_id"))
            db.commit()
            logger.info("Shipment created successfully for order %s", order.id)
            
        db.close()
    except Exception as exc:
        logger.error("Failed to run background shipment creation for order %s: %s", order_id, exc)
