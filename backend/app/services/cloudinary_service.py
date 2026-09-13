"""
JACRAL – Cloudinary Image Storage Service.
Provides upload and management of product and CMS images via Cloudinary.
Falls back to local static storage if Cloudinary credentials are not configured in .env.
"""
import logging
import os
import uuid
from pathlib import Path
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

# Check if Cloudinary is configured
_cloudinary_initialized = False

def _init_cloudinary():
    global _cloudinary_initialized
    if _cloudinary_initialized:
        return True
    try:
        import cloudinary
        import cloudinary.uploader

        if settings.CLOUDINARY_URL:
            cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)
            _cloudinary_initialized = True
            logger.info("Cloudinary initialized via CLOUDINARY_URL.")
            return True
        elif settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                secure=True,
            )
            _cloudinary_initialized = True
            logger.info("Cloudinary initialized via credentials.")
            return True
    except Exception as e:
        logger.warning(f"Cloudinary setup notice: {e}")
    return False


def upload_image_to_storage(
    file_bytes: bytes,
    folder: str = "products",
    filename: Optional[str] = None,
    local_fallback_dir: Optional[Path] = None,
) -> str:
    """
    Upload an image to Cloudinary if configured.
    Otherwise saves to local static directory and returns the relative /static/ path.
    """
    ext = "jpg"
    if filename and "." in filename:
        ext = filename.rsplit(".", 1)[-1].lower()

    # 1. Attempt Cloudinary upload if configured
    if _init_cloudinary():
        try:
            import cloudinary.uploader

            public_id = f"jacral/{folder}/{uuid.uuid4().hex[:12]}"
            upload_result = cloudinary.uploader.upload(
                file_bytes,
                public_id=public_id,
                resource_type="image",
                overwrite=True,
            )
            secure_url = upload_result.get("secure_url") or upload_result.get("url")
            if secure_url:
                logger.info(f"Image uploaded to Cloudinary: {secure_url}")
                return secure_url
        except Exception as e:
            logger.error(f"Cloudinary upload error: {e}. Falling back to local storage.")

    # 2. Fallback to local static storage
    if local_fallback_dir is None:
        local_fallback_dir = Path(__file__).resolve().parents[2] / "static" / folder
    local_fallback_dir.mkdir(parents=True, exist_ok=True)

    unique_filename = f"{uuid.uuid4().hex[:10]}.{ext}"
    dest = local_fallback_dir / unique_filename
    with open(dest, "wb") as f:
        f.write(file_bytes)

    return f"/static/{folder}/{unique_filename}"
