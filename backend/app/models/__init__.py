"""
JACRAL – Models package.
Import all models here so Alembic can discover them.
"""
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.cart import Cart, CartItem
from app.models.address import Address
from app.models.coupon import Coupon
from app.models.order import Order, OrderItem
from app.models.payment import Payment
from app.models.utm_visit import UtmVisit
from app.models.audit_log import AuditLog
from app.models.policy import Policy

from app.models.content import (
    WebsiteSetting,
    LandingPageSlide,
    LandingPageSection,
    MediaAsset,
)
from app.models.review import CustomerReview
from app.models.how_to_use import HowToUseStep
from app.models.role_permissions import RolePermission
from app.models.deals import Deal

__all__ = [
    "User",
    "Category",
    "Product",
    "Cart",
    "CartItem",
    "Address",
    "Coupon",
    "Order",
    "OrderItem",
    "Payment",
    "UtmVisit",
    "AuditLog",
    "Policy",
    "WebsiteSetting",
    "LandingPageSlide",
    "LandingPageSection",
    "MediaAsset",
    "CustomerReview",
    "HowToUseStep",
    "RolePermission"
    "Deal",
]