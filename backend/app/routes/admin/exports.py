from datetime import date, datetime, timedelta, timezone
from typing import Literal, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.security.permissions import require_admin
from app.services.export_service import generate_pdf_export, generate_excel_export

router = APIRouter(tags=["Admin Exports"])


def _resolve_dates(
    range_param: Optional[Literal["today", "this_week", "this_month", "custom"]],
    start_date: Optional[date],
    end_date: Optional[date],
) -> tuple[Optional[date], Optional[date]]:
    now = datetime.now(timezone.utc).date()
    if range_param == "today":
        return now, now
    elif range_param == "this_week":
        start_of_week = now - timedelta(days=now.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        return start_of_week, end_of_week
    elif range_param == "this_month":
        start_of_month = now.replace(day=1)
        # Next month 1st day minus 1 day
        if now.month == 12:
            next_month_1st = date(now.year + 1, 1, 1)
        else:
            next_month_1st = date(now.year, now.month + 1, 1)
        end_of_month = next_month_1st - timedelta(days=1)
        return start_of_month, end_of_month
    elif range_param == "custom":
        if not start_date or not end_date:
            raise HTTPException(status_code=400, detail="start_date and end_date are required when range='custom'")
        return start_date, end_date
    return start_date, end_date


@router.get("/pdf/{entity_type}", summary="Export data as PDF")
def export_pdf(
    entity_type: str,
    range: Optional[Literal["today", "this_week", "this_month", "custom"]] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if entity_type not in ["customers", "products", "orders"]:
        raise HTTPException(status_code=400, detail="Invalid export entity")

    s_date, e_date = _resolve_dates(range, start_date, end_date)
    pdf_buffer = generate_pdf_export(db, entity_type, start_date=s_date, end_date=e_date)

    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=jacral_{entity_type}_export.pdf"},
    )


@router.get("/excel/{entity_type}", summary="Export data as Excel")
def export_excel(
    entity_type: str,
    range: Optional[Literal["today", "this_week", "this_month", "custom"]] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if entity_type not in ["customers", "products", "orders"]:
        raise HTTPException(status_code=400, detail="Invalid export entity")

    s_date, e_date = _resolve_dates(range, start_date, end_date)
    excel_buffer = generate_excel_export(db, entity_type, start_date=s_date, end_date=e_date)

    return Response(
        content=excel_buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=jacral_{entity_type}_export.xlsx"},
    )
