# app/api/routes_appointments.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional

from app.core.auth_cognito import get_current_user, AuthUser
from app.models.appointment import AppointmentCreate, AppointmentOut, AppointmentList
from app.services.user_service import get_user_by_id
from app.services.appointment_service import (
    create_appointment as create_appointment_service,
    list_appointments_for_business,
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
        item = create_appointment_service(user_item, payload)
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
