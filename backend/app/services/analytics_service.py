"""
JACRAL – Analytics service.
All aggregation is done in SQL – no full table loads into Python.
"""
from decimal import Decimal

from sqlalchemy import case, func, text
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.models.utm_visit import UtmVisit
from app.schemas.analytics import (
    DashboardOverview,
    TopProduct,
    TopCustomer,
    TrafficOverview,
    UtmCampaignStat,
    UtmSourceStat,
)

LOW_STOCK_THRESHOLD = 10


def get_dashboard_overview(db: Session) -> DashboardOverview:
    total_customers = db.query(func.count(User.id)).filter(User.role == "customer").scalar() or 0
    total_products = db.query(func.count(Product.id)).filter(Product.is_active.is_(True)).scalar() or 0

    order_stats = db.query(
        func.count(Order.id).label("total"),
        func.coalesce(func.sum(case((Order.payment_status == "paid", Order.total_amount), else_=0)), 0).label("revenue"),
        func.sum(case((Order.status == "pending", 1), else_=0)).label("pending"),
        func.sum(case((Order.status == "confirmed", 1), else_=0)).label("confirmed"),
        func.sum(case((Order.status == "delivered", 1), else_=0)).label("completed"),
        func.sum(case((Order.status == "cancelled", 1), else_=0)).label("cancelled"),
    ).one()

    low_stock = (
        db.query(func.count(Product.id))
        .filter(Product.is_active.is_(True), Product.stock <= LOW_STOCK_THRESHOLD)
        .scalar()
        or 0
    )

    return DashboardOverview(
        total_customers=total_customers,
        total_products=total_products,
        total_orders=order_stats.total or 0,
        total_revenue=Decimal(str(order_stats.revenue or 0)),
        pending_orders=order_stats.pending or 0,
        confirmed_orders=order_stats.confirmed or 0,
        completed_orders=order_stats.completed or 0,
        cancelled_orders=order_stats.cancelled or 0,
        low_stock_products=low_stock,
    )


def get_top_products(db: Session, limit: int = 10) -> list[TopProduct]:
    rows = (
        db.query(
            Product.id.label("product_id"),
            Product.name.label("product_name"),
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.subtotal).label("revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
        .all()
    )
    return [
        TopProduct(
            product_id=r.product_id,
            product_name=r.product_name,
            total_sold=r.total_sold or 0,
            revenue=Decimal(str(r.revenue or 0)),
        )
        for r in rows
    ]


def get_top_customers(db: Session, limit: int = 10) -> list[TopCustomer]:
    rows = (
        db.query(
            User.id.label("user_id"),
            User.name.label("name"),
            func.count(func.distinct(Order.id)).label("total_orders"),
            func.sum(Order.total_amount).label("total_spent"),
            func.sum(OrderItem.quantity).label("total_items_ordered")
        )
        .join(Order, Order.user_id == User.id)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .filter(Order.status != "cancelled")
        .group_by(User.id, User.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
        .all()
    )
    return [
        TopCustomer(
            user_id=r.user_id,
            name=r.name,
            total_orders=r.total_orders or 0,
            total_spent=Decimal(str(r.total_spent or 0)),
            total_items_ordered=r.total_items_ordered or 0,
        )
        for r in rows
    ]

def get_traffic_overview(db: Session) -> TrafficOverview:
    total = db.query(func.count(UtmVisit.id)).scalar() or 0

    by_source_rows = (
        db.query(UtmVisit.utm_source, func.count(UtmVisit.id).label("cnt"))
        .group_by(UtmVisit.utm_source)
        .order_by(func.count(UtmVisit.id).desc())
        .all()
    )

    by_campaign_rows = (
        db.query(
            UtmVisit.utm_campaign,
            UtmVisit.utm_source,
            func.count(UtmVisit.id).label("cnt"),
        )
        .group_by(UtmVisit.utm_campaign, UtmVisit.utm_source)
        .order_by(func.count(UtmVisit.id).desc())
        .limit(50)
        .all()
    )

    return TrafficOverview(
        total_visits=total,
        by_source=[UtmSourceStat(utm_source=r.utm_source, visitor_count=r.cnt) for r in by_source_rows],
        by_campaign=[
            UtmCampaignStat(utm_campaign=r.utm_campaign, utm_source=r.utm_source, visitor_count=r.cnt)
            for r in by_campaign_rows
        ],
    )
