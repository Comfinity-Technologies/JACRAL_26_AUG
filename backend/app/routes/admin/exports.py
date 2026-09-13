from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.security.permissions import require_admin, require_super_admin
from app.services.export_service import generate_pdf_export, generate_excel_export

router = APIRouter(tags=["Admin Exports"])

@router.get("/pdf/{entity_type}", summary="Export data as PDF")
def export_pdf(
    entity_type: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if entity_type not in ["customers", "products", "orders"]:
        raise HTTPException(status_code=400, detail="Invalid export entity")
    
    pdf_buffer = generate_pdf_export(db, entity_type)
    
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=jacral_{entity_type}_export.pdf"}
    )

@router.get("/excel/{entity_type}", summary="Export data as Excel")
def export_excel(
    entity_type: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if entity_type not in ["customers", "products", "orders"]:
        raise HTTPException(status_code=400, detail="Invalid export entity")
    
    excel_buffer = generate_excel_export(db, entity_type)
    
    return Response(
        content=excel_buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=jacral_{entity_type}_export.xlsx"}
    )
