"""
JACRAL Backend - Main Application
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import Base, engine
import app.models  # This ensures all models are imported before metadata creation (if used)
from app.services.audit_service import client_ip_var

from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.categories import router as categories_router
from app.routes.products import router as products_router
from app.routes.cart import router as cart_router
from app.routes.addresses import router as addresses_router
from app.routes.orders import router as orders_router
from app.routes.payments import router as payments_router
from app.routes.coupons import router as coupons_router
from app.routes.analytics import router as analytics_router
from app.routes.policies import router as policies_router
from app.routes.content import router as content_router
from app.routes.reviews import router as reviews_router

from app.routes.admin.users import router as admin_users_router
from app.routes.admin.products import router as admin_products_router
from app.routes.admin.categories import router as admin_categories_router
from app.routes.admin.orders import router as admin_orders_router
from app.routes.admin.coupons import router as admin_coupons_router
from app.routes.admin.analytics import router as admin_analytics_router
from app.routes.admin.exports import router as admin_exports_router
from app.routes.admin.content import router as admin_content_router
from app.routes.admin.reviews import router as admin_reviews_router
from app.routes.admin.permissions import router as admin_permissions_router
from app.routes.deals import router as deals_router
from app.routes.admin.deals import router as admin_deals_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.seed import seed_admin_users
from app.seed_content import seed_cms_content

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    redirect_slashes=False,
)

@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        seed_admin_users()
        seed_cms_content()
    except Exception as e:
        logger.error(f"Startup seed error: {e}")


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
allowed_origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
allowed_origins = list(dict.fromkeys(o for o in allowed_origins if o))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Rate Limiting & Context Variables
# ---------------------------------------------------------
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from fastapi import Request

@app.middleware("http")
async def add_context_vars(request: Request, call_next):
    ip = request.client.host if request.client else None
    client_ip_var.set(ip)
    return await call_next(request)

# ---------------------------------------------------------
# Static Files Setup (for uploaded product images)
# ---------------------------------------------------------
static_dir = Path(__file__).resolve().parent.parent / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# ---------------------------------------------------------
# API routes
# ---------------------------------------------------------
app.include_router(health_router)
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(categories_router, prefix="/api/v1/categories")
app.include_router(products_router, prefix="/api/v1/products")
app.include_router(cart_router, prefix="/api/v1/cart")
app.include_router(addresses_router, prefix="/api/v1/addresses")
app.include_router(orders_router, prefix="/api/v1/orders")
app.include_router(payments_router, prefix="/api/v1/payments")
app.include_router(coupons_router, prefix="/api/v1/coupons")
app.include_router(analytics_router, prefix="/api/v1/analytics")
app.include_router(policies_router, prefix="/api/v1/policies")
app.include_router(content_router, prefix="/api/v1/content")
app.include_router(reviews_router, prefix="/api/v1/reviews")
app.include_router(deals_router, prefix="/api/v1/deals")

# Admin routes
app.include_router(admin_users_router, prefix="/api/v1/admin/users")
app.include_router(admin_products_router, prefix="/api/v1/admin/products")
app.include_router(admin_categories_router, prefix="/api/v1/admin/categories")
app.include_router(admin_orders_router, prefix="/api/v1/admin/orders")
app.include_router(admin_coupons_router, prefix="/api/v1/admin/coupons")
app.include_router(admin_analytics_router, prefix="/api/v1/admin/analytics")
app.include_router(admin_exports_router, prefix="/api/v1/admin/exports")
app.include_router(admin_content_router, prefix="/api/v1/admin/content")
app.include_router(admin_reviews_router, prefix="/api/v1/admin/reviews")
app.include_router(admin_permissions_router, prefix="/api/v1/admin/users/permissions")
app.include_router(admin_deals_router, prefix="/api/v1/admin/deals")