from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.utm_visit import UtmVisit
from app.schemas.analytics import (
    DashboardOverview,
    TopProduct,
    TopCustomer,
    TrafficOverview,
    UtmSourceStat,
    UtmCampaignStat,
)

def get_dashboard_overview(db: Session) -> DashboardOverview:
    total_customers = db.query(func.count(User.id)).filter(User.role.in_(["CUSTOMER", "customer"])).scalar() or 0
    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    
    # Calculate revenue only for paid orders
    total_revenue = db.query(func.sum(Order.total_amount)).filter(Order.payment_status == "paid").scalar() or Decimal("0.0")
    
    pending_orders = db.query(func.count(Order.id)).filter(Order.status == "pending").scalar() or 0
    confirmed_orders = db.query(func.count(Order.id)).filter(Order.status == "confirmed").scalar() or 0
    completed_orders = db.query(func.count(Order.id)).filter(Order.status == "delivered").scalar() or 0
    cancelled_orders = db.query(func.count(Order.id)).filter(Order.status == "cancelled").scalar() or 0
    
    low_stock_products = db.query(func.count(Product.id)).filter(Product.stock <= 5, Product.is_active == True).scalar() or 0

    return DashboardOverview(
        total_customers=total_customers,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=total_revenue,
        pending_orders=pending_orders,
        confirmed_orders=confirmed_orders,
        completed_orders=completed_orders,
        cancelled_orders=cancelled_orders,
        low_stock_products=low_stock_products,
    )

def get_top_products(db: Session, limit: int = 5) -> list[TopProduct]:
    results = (
        db.query(
            Product.id,
            Product.name,
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.price_at_time * OrderItem.quantity).label("revenue")
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.payment_status == "paid")
        .group_by(Product.id, Product.name)
        .order_by(desc("total_sold"))
        .limit(limit)
        .all()
    )
    
    return [
        TopProduct(
            product_id=row.id,
            product_name=row.name,
            total_sold=int(row.total_sold or 0),
            revenue=Decimal(str(row.revenue or 0.0))
        )
        for row in results
    ]

def get_top_customers(db: Session, limit: int = 10) -> list[TopCustomer]:
    results = (
        db.query(
            User.id,
            User.name,
            func.count(Order.id).label("total_orders"),
            func.sum(Order.total_amount).label("total_spent"),
        )
        .join(Order, Order.user_id == User.id)
        .filter(Order.status != "cancelled")
        .group_by(User.id, User.name)
        .order_by(desc("total_spent"))
        .limit(limit)
        .all()
    )

    return [
        TopCustomer(
            user_id=row.id,
            name=row.name,
            total_orders=int(row.total_orders or 0),
            total_spent=Decimal(str(row.total_spent or 0.0)),
        )
        for row in results
    ]

def get_traffic_overview(db: Session) -> TrafficOverview:
    total_visits = db.query(func.count(UtmVisit.id)).scalar() or 0
    
    source_stats = (
        db.query(
            UtmVisit.utm_source,
            func.count(UtmVisit.id).label("visitor_count")
        )
        .group_by(UtmVisit.utm_source)
        .order_by(desc("visitor_count"))
        .all()
    )
    
    campaign_stats = (
        db.query(
            UtmVisit.utm_campaign,
            UtmVisit.utm_source,
            func.count(UtmVisit.id).label("visitor_count")
        )
        .filter(UtmVisit.utm_campaign.isnot(None))
        .group_by(UtmVisit.utm_campaign, UtmVisit.utm_source)
        .order_by(desc("visitor_count"))
        .all()
    )
    
    return TrafficOverview(
        total_visits=total_visits,
        by_source=[UtmSourceStat(utm_source=row.utm_source, visitor_count=row.visitor_count) for row in source_stats],
        by_campaign=[UtmCampaignStat(utm_campaign=row.utm_campaign, utm_source=row.utm_source, visitor_count=row.visitor_count) for row in campaign_stats]
    )