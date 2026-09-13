"""
JACRAL – Application configuration.
All settings are loaded from environment variables / .env file.
"""
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ------------------------------------------------------------------
    # Application
    # ------------------------------------------------------------------
    APP_NAME: str = "JACRAL API"
    APP_VERSION: str = "1.0.0"

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------
    DATABASE_URL: str

    # ------------------------------------------------------------------
    # Frontend
    # ------------------------------------------------------------------
    FRONTEND_URL: str = "http://localhost:5173"

    # ------------------------------------------------------------------
    # JWT
    # ------------------------------------------------------------------
    JWT_SECRET_KEY: str = "change-this-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ------------------------------------------------------------------
    # Admin Seed Credentials
    # ------------------------------------------------------------------
    ADMIN_EMAIL: str = "admin@jacral.com"
    ADMIN_PASSWORD: str = "AdminPassword123!"

    SUPER_ADMIN_EMAIL: str = "superadmin@jacral.com"
    SUPER_ADMIN_PASSWORD: str = "SuperAdminPassword123!"

    PRO_ADMIN_EMAIL: str = "proadmin@jacral.com"
    PRO_ADMIN_PASSWORD: str = "ProAdminPassword123!"


    # ------------------------------------------------------------------
    # Payment – Razorpay
    # ------------------------------------------------------------------
    PAYMENT_PROVIDER: str = "razorpay"
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = None

    # ------------------------------------------------------------------
    # Payment – Cashfree (optional)
    # ------------------------------------------------------------------
    CASHFREE_APP_ID: Optional[str] = None
    CASHFREE_SECRET_KEY: Optional[str] = None
    CASHFREE_WEBHOOK_SECRET: Optional[str] = None

    # ------------------------------------------------------------------
    # SMTP / Email
    # ------------------------------------------------------------------
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@jacral.com"

    # ------------------------------------------------------------------
    # Shiprocket (optional)
    # ------------------------------------------------------------------
    SHIPROCKET_EMAIL: Optional[str] = None
    SHIPROCKET_PASSWORD: Optional[str] = None

    # ------------------------------------------------------------------
    # Cloudinary Image Storage
    # ------------------------------------------------------------------
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    CLOUDINARY_URL: Optional[str] = None

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    @property
    def razorpay_configured(self) -> bool:
        return bool(self.RAZORPAY_KEY_ID and self.RAZORPAY_KEY_SECRET)

    @property
    def smtp_configured(self) -> bool:
        return bool(self.SMTP_HOST and self.SMTP_USERNAME and self.SMTP_PASSWORD)

    @property
    def shiprocket_configured(self) -> bool:
        return bool(self.SHIPROCKET_EMAIL and self.SHIPROCKET_PASSWORD)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()