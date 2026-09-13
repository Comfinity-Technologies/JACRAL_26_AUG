"""
JACRAL – Analytics schemas.
"""
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class DashboardOverview(BaseModel):
    total_customers: int
    total_products: int
    total_orders: int
    total_revenue: Decimal
    pending_orders: int
    confirmed_orders: int
    completed_orders: int
    cancelled_orders: int
    low_stock_products: int


class TopProduct(BaseModel):
    product_id: int
    product_name: str
    total_sold: int
    revenue: Decimal


class TopCustomer(BaseModel):
    user_id: int
    name: str
    total_orders: int
    total_spent: Decimal
    total_items_ordered: int


class UtmSourceStat(BaseModel):
    utm_source: Optional[str]
    visitor_count: int


class UtmCampaignStat(BaseModel):
    utm_campaign: Optional[str]
    utm_source: Optional[str]
    visitor_count: int


class TrafficOverview(BaseModel):
    total_visits: int
    by_source: list[UtmSourceStat]
    by_campaign: list[UtmCampaignStat]


class UtmVisitRequest(BaseModel):
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_term: Optional[str] = None
    utm_content: Optional[str] = None
    landing_page: Optional[str] = None
    referrer: Optional[str] = None
    session_id: Optional[str] = None
