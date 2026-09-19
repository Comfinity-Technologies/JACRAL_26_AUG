"""
JACRAL – Pincode lookup route.

GET /api/v1/pincode/{code}/lookup

Calls India Post's public API server-side and returns city/state/district.
Successful lookups are cached in-memory (24h TTL) since pincode→location is static data.
"""
import logging
import time
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Pincode"])

# Simple in-memory cache: { pincode: (data, expires_at) }
_PINCODE_CACHE: dict[str, tuple[dict, float]] = {}
_CACHE_TTL = 24 * 60 * 60  # 24 hours

_INDIA_POST_URL = "https://api.postalpincode.in/pincode/{}"


def _get_cached(code: str) -> Optional[dict]:
    entry = _PINCODE_CACHE.get(code)
    if entry:
        data, expires_at = entry
        if time.time() < expires_at:
            return data
        # Expired — remove it
        del _PINCODE_CACHE[code]
    return None


def _set_cache(code: str, data: dict) -> None:
    _PINCODE_CACHE[code] = (data, time.time() + _CACHE_TTL)


@router.get(
    "/{code}/lookup",
    summary="Auto-fill city/state/district from a 6-digit Indian PIN code",
)
def lookup_pincode(code: str):
    """
    Looks up a 6-digit Indian pincode using the India Post public API.
    Returns { city, state, district } on success, or 404 if invalid.

    Results are cached in-memory for 24 hours since the pincode→location
    mapping is static and this endpoint is hit frequently during checkout.
    """
    # Validate format
    if not code.isdigit() or len(code) != 6:
        raise HTTPException(status_code=400, detail="Pincode must be exactly 6 digits.")

    # Check cache first
    cached = _get_cached(code)
    if cached:
        return cached

    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.get(_INDIA_POST_URL.format(code))
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:
        logger.warning("Pincode API request failed for %s: %s", code, exc)
        raise HTTPException(
            status_code=502,
            detail="Pincode lookup service temporarily unavailable. Please enter your address manually.",
        )

    # India Post API response format:
    # [{ "Status": "Success", "PostOffice": [{ "Name", "District", "Division", "Region", "State", ... }] }]
    if not data or not isinstance(data, list) or data[0].get("Status") != "Success":
        raise HTTPException(status_code=404, detail=f"Pincode '{code}' not found.")

    post_offices = data[0].get("PostOffice") or []
    if not post_offices:
        raise HTTPException(status_code=404, detail=f"No post office found for pincode '{code}'.")

    # Use the first post office entry
    po = post_offices[0]
    result = {
        "pincode": code,
        "city": po.get("Division") or po.get("Name") or "",
        "district": po.get("District") or "",
        "state": po.get("State") or "",
        "post_office_name": po.get("Name") or "",
    }

    _set_cache(code, result)
    return result
