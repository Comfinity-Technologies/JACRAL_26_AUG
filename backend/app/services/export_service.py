import io
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import pandas as pd

def generate_pdf_export(db: Session, entity_type: str) -> io.BytesIO:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, f"JACRAL Export: {entity_type.capitalize()}")
    
    c.setFont("Helvetica", 10)
    y_position = height - 80
    
    if entity_type == "customers":
        customers = db.query(User).filter(User.role == "CUSTOMER").all()
        c.drawString(50, y_position, "ID | Name | Email | Created At")
        y_position -= 20
        for cust in customers:
            if y_position < 50:
                c.showPage()
                y_position = height - 50
            c.drawString(50, y_position, f"{cust.id} | {cust.name} | {cust.email} | {cust.created_at.strftime('%Y-%m-%d')}")
            y_position -= 15
            
    elif entity_type == "products":
        products = db.query(Product).all()
        c.drawString(50, y_position, "ID | Name | Price | Stock | Active")
        y_position -= 20
        for p in products:
            if y_position < 50:
                c.showPage()
                y_position = height - 50
            c.drawString(50, y_position, f"{p.id} | {p.name[:25]} | INR {p.price} | {p.stock} | {p.is_active}")
            y_position -= 15
            
    elif entity_type == "orders":
        orders = db.query(Order).all()
        c.drawString(50, y_position, "ID | Customer ID | Amount | Status | Created")
        y_position -= 20
        for o in orders:
            if y_position < 50:
                c.showPage()
                y_position = height - 50
            c.drawString(50, y_position, f"{o.id} | {o.user_id} | INR {o.total_amount} | {o.status} | {o.created_at.strftime('%Y-%m-%d')}")
            y_position -= 15

    c.save()
    buffer.seek(0)
    return buffer

def generate_excel_export(db: Session, entity_type: str) -> io.BytesIO:
    buffer = io.BytesIO()
    
    data = []
    if entity_type == "customers":
        customers = db.query(User).filter(User.role == "CUSTOMER").all()
        for c in customers:
            data.append({"ID": c.id, "Name": c.name, "Email": c.email, "Created": c.created_at.strftime('%Y-%m-%d')})
            
    elif entity_type == "products":
        products = db.query(Product).all()
        for p in products:
            data.append({"ID": p.id, "Name": p.name, "Price": p.price, "Stock": p.stock, "Active": p.is_active})
            
    elif entity_type == "orders":
        orders = db.query(Order).all()
        for o in orders:
            data.append({"ID": o.id, "Customer ID": o.user_id, "Amount": o.total_amount, "Status": o.status, "Created": o.created_at.strftime('%Y-%m-%d')})
    
    df = pd.DataFrame(data)
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name=entity_type.capitalize())
        
    buffer.seek(0)
    return buffer
