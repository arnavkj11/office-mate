from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import HTMLResponse
from typing import Optional

from app.core.auth_cognito import get_current_user, AuthUser
from app.models.appointment import AppointmentCreate, AppointmentOut, AppointmentList
from app.services.user_service import get_user_by_id
from app.services.appointment_service import (
    create_appointment,
    list_appointments_for_business,
    get_appointment_by_id,
    update_appointment_status,
)

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _load_user_item(user: AuthUser):
    item: Optional[dict] = get_user_by_id(user.sub)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return item


def _item_to_appointment_out(item: dict) -> AppointmentOut:
    return AppointmentOut(
        appointmentId=item["appointmentId"],
        businessId=item["businessId"],
        userId=item["userId"],
        title=item["title"],
        clientName=item.get("clientName", ""),
        inviteeEmail=item["inviteeEmail"],
        startTime=item["startTime"],
        endTime=item["endTime"],
        location=item.get("location", ""),
        notes=item.get("notes", ""),
        status=item.get("status", "pending"),
        createdAt=item.get("createdAt", ""),
        updatedAt=item.get("updatedAt", ""),
    )


@router.post("", response_model=AppointmentOut)
def create_appointment_route(
    payload: AppointmentCreate,
    user: AuthUser = Depends(get_current_user),
) -> AppointmentOut:
    user_item = _load_user_item(user)
    try:
        item = create_appointment(user_item, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    return _item_to_appointment_out(item)


@router.get("", response_model=AppointmentList)
def list_appointments_route(
    user: AuthUser = Depends(get_current_user),
) -> AppointmentList:
    user_item = _load_user_item(user)
    business_id = user_item.get("defaultBusinessId")
    if not business_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no default business configured",
        )
    items = list_appointments_for_business(business_id)
    out_items = [_item_to_appointment_out(i) for i in items]
    return AppointmentList(items=out_items)


@router.get("/rsvp", response_class=HTMLResponse)
def rsvp_appointment(
    businessId: str = Query(..., alias="businessId"),
    appointmentId: str = Query(..., alias="appointmentId"),
    token: str = Query(..., alias="token"),
    choice: str = Query(..., alias="choice"),
):
    item = get_appointment_by_id(businessId, appointmentId)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )

    stored_token = item.get("rsvpToken")
    if not stored_token or stored_token != token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid RSVP token",
        )

    c = choice.lower()
    if c == "accepted":
        new_status = "confirmed"
        msg = "Your appointment has been confirmed."
    elif c == "declined":
        new_status = "cancelled"
        msg = "Your appointment has been cancelled."
    elif c == "maybe":
        new_status = "tentative"
        msg = "Your response has been recorded as maybe."
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid RSVP choice",
        )

    update_appointment_status(businessId, appointmentId, new_status)

    html = (
        "<html><head><title>Appointment RSVP</title></head>"
        "<body>"
        "<h2>{}</h2>"
        "<p>Status: <strong>{}</strong></p>"
        "</body></html>"
    ).format(msg, new_status)

    return html
