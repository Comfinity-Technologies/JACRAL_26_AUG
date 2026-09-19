from datetime import date, datetime, time, timezone
import io
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
import pandas as pd


def _apply_date_filter(query, model_col, start_date: Optional[date], end_date: Optional[date]):
    if start_date:
        start_dt = datetime.combine(start_date, time.min).replace(tzinfo=timezone.utc)
        query = query.filter(model_col >= start_dt)
    if end_date:
        end_dt = datetime.combine(end_date, time.max).replace(tzinfo=timezone.utc)
        query = query.filter(model_col <= end_dt)
    return query


def generate_pdf_export(
    db: Session,
    entity_type: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> io.BytesIO:
    buffer = io.BytesIO()
    # Use landscape for wide tables
    page_size = landscape(letter)
    c = canvas.Canvas(buffer, pagesize=page_size)
    width, height = page_size

    range_str = f" ({start_date} to {end_date})" if start_date or end_date else ""
    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, height - 40, f"JACRAL Export: {entity_type.capitalize()}{range_str}")
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(40, height - 55, "Solis of Life Pvt. Ltd. — Internal Admin Report")

    c.setFont("Helvetica", 8)
    y_position = height - 80

    if entity_type == "customers":
        query = db.query(User).filter(User.role == "CUSTOMER")
        query = _apply_date_filter(query, User.created_at, start_date, end_date)
        customers = query.order_by(User.created_at.desc()).all()

        headers = "ID | Name | Email | Phone | Active | MFA | Created At"
        c.setFont("Helvetica-Bold", 8)
        c.drawString(40, y_position, headers)
        c.setFont("Helvetica", 8)
        y_position -= 15

        for cust in customers:
            if y_position < 40:
                c.showPage()
                y_position = height - 40
            phone = cust.phone or "—"
            created = cust.created_at.strftime("%Y-%m-%d %H:%M") if cust.created_at else "—"
            row_str = f"{cust.id} | {cust.name} | {cust.email} | {phone} | {cust.is_active} | {cust.mfa_enabled} | {created}"
            c.drawString(40, y_position, row_str[:130])
            y_position -= 12

    elif entity_type == "products":
        query = db.query(Product)
        query = _apply_date_filter(query, Product.created_at, start_date, end_date)
        products = query.order_by(Product.created_at.desc()).all()

        headers = "ID | SKU | Name | Price (₹) | Regular (₹) | Stock | Active | Category ID | Created At"
        c.setFont("Helvetica-Bold", 8)
        c.drawString(40, y_position, headers)
        c.setFont("Helvetica", 8)
        y_position -= 15

        for p in products:
            if y_position < 40:
                c.showPage()
                y_position = height - 40
            sku = p.sku or "—"
            reg_price = f"₹{p.regular_price}" if p.regular_price else "—"
            cat_id = p.category_id or "—"
            created = p.created_at.strftime("%Y-%m-%d") if p.created_at else "—"
            row_str = f"{p.id} | {sku} | {p.name[:30]} | ₹{p.price} | {reg_price} | {p.stock} | {p.is_active} | {cat_id} | {created}"
            c.drawString(40, y_position, row_str[:130])
            y_position -= 12

    elif entity_type == "orders":
        query = db.query(Order)
        query = _apply_date_filter(query, Order.created_at, start_date, end_date)
        orders = query.order_by(Order.created_at.desc()).all()

        headers = "Order ID | User ID | Name | Email | Subtotal | Tax | Shipping | Discount | Total (₹) | Status | Payment | Created At"
        c.setFont("Helvetica-Bold", 8)
        c.drawString(40, y_position, headers)
        c.setFont("Helvetica", 8)
        y_position -= 15

        for o in orders:
            if y_position < 40:
                c.showPage()
                y_position = height - 40
            created = o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else "—"
            coupon = f" ({o.coupon_code})" if o.coupon_code else ""
            row_str = (
                f"#{o.id} | User {o.user_id} | {o.shipping_name} | {o.shipping_email} | "
                f"₹{o.subtotal or 0} | ₹{o.tax_amount or 0} | ₹{o.shipping_charge or 0} | "
                f"₹{o.discount_amount or 0}{coupon} | ₹{o.total_amount} | {o.status} | {o.payment_status} | {created}"
            )
            c.drawString(40, y_position, row_str[:140])
            y_position -= 12

    c.save()
    buffer.seek(0)
    return buffer


def generate_excel_export(
    db: Session,
    entity_type: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> io.BytesIO:
    buffer = io.BytesIO()
    data = []

    if entity_type == "customers":
        query = db.query(User).filter(User.role == "CUSTOMER")
        query = _apply_date_filter(query, User.created_at, start_date, end_date)
        customers = query.order_by(User.created_at.desc()).all()

        for c in customers:
            data.append({
                "User ID": c.id,
                "Name": c.name,
                "Email": c.email,
                "Phone": c.phone or "",
                "Role": c.role,
                "Is Active": c.is_active,
                "MFA Enabled": c.mfa_enabled,
                "OAuth Provider": c.oauth_provider or "",
                "Created At": c.created_at.strftime("%Y-%m-%d %H:%M:%S") if c.created_at else "",
                "Updated At": c.updated_at.strftime("%Y-%m-%d %H:%M:%S") if c.updated_at else "",
            })

    elif entity_type == "products":
        query = db.query(Product)
        query = _apply_date_filter(query, Product.created_at, start_date, end_date)
        products = query.order_by(Product.created_at.desc()).all()

        for p in products:
            data.append({
                "Product ID": p.id,
                "SKU": p.sku or "",
                "Name": p.name,
                "Slug": p.slug or "",
                "Short Description": p.short_description or "",
                "Description": p.description or "",
                "Price": float(p.price),
                "Regular Price": float(p.regular_price) if p.regular_price else None,
                "Stock": p.stock,
                "Category ID": p.category_id,
                "Is Active": p.is_active,
                "Is Featured": p.is_featured,
                "Created At": p.created_at.strftime("%Y-%m-%d %H:%M:%S") if p.created_at else "",
                "Updated At": p.updated_at.strftime("%Y-%m-%d %H:%M:%S") if p.updated_at else "",
            })

    elif entity_type == "orders":
        query = db.query(Order)
        query = _apply_date_filter(query, Order.created_at, start_date, end_date)
        orders = query.order_by(Order.created_at.desc()).all()

        for o in orders:
            data.append({
                "Order ID": o.id,
                "User ID": o.user_id,
                "Status": o.status,
                "Payment Status": o.payment_status,
                "Subtotal": float(o.subtotal or 0),
                "Tax Amount (5%)": float(o.tax_amount or 0),
                "CGST Amount": float(o.cgst_amount or 0),
                "SGST Amount": float(o.sgst_amount or 0),
                "IGST Amount": float(o.igst_amount or 0),
                "Shipping Charge": float(o.shipping_charge or 0),
                "Discount Amount": float(o.discount_amount or 0),
                "Coupon Code": o.coupon_code or "",
                "Grand Total": float(o.total_amount),
                "Shipping Name": o.shipping_name,
                "Shipping Email": o.shipping_email,
                "Shipping Phone": o.shipping_phone,
                "Shipping Address": o.shipping_address,
                "Shipment ID": o.shipment_id or "",
                "Accepted Terms": o.accepted_terms,
                "Accepted Terms At": o.accepted_terms_at.strftime("%Y-%m-%d %H:%M:%S") if o.accepted_terms_at else "",
                "Created At": o.created_at.strftime("%Y-%m-%d %H:%M:%S") if o.created_at else "",
                "Updated At": o.updated_at.strftime("%Y-%m-%d %H:%M:%S") if o.updated_at else "",
            })

    df = pd.DataFrame(data)
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name=entity_type.capitalize())

    buffer.seek(0)
    return buffer
