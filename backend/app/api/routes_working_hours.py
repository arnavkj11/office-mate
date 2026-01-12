from fastapi import APIRouter, Depends
from app.core.auth_cognito import get_current_user
from app.models.working_hours import WorkingHours
from app.services.working_hours_service import (
    get_working_hours,
    save_working_hours,
)

router = APIRouter(
    prefix="/working-hours",
    tags=["working-hours"],
)

DEFAULT_WORKING_HOURS = {
    "timezone": "America/Los_Angeles",
    "weekly": [
        {"day": "Sunday", "enabled": False, "start": "09:00", "end": "17:00"},
        {"day": "Monday", "enabled": True, "start": "09:00", "end": "17:00"},
        {"day": "Tuesday", "enabled": True, "start": "09:00", "end": "17:00"},
        {"day": "Wednesday", "enabled": True, "start": "09:00", "end": "17:00"},
        {"day": "Thursday", "enabled": True, "start": "09:00", "end": "17:00"},
        {"day": "Friday", "enabled": True, "start": "09:00", "end": "17:00"},
        {"day": "Saturday", "enabled": False, "start": "09:00", "end": "17:00"},
    ],
    "overrides": [],
}


@router.get("/me")
async def get_my_working_hours(current_user=Depends(get_current_user)):
    wh = get_working_hours(current_user.sub)
    return wh if wh is not None else DEFAULT_WORKING_HOURS


@router.put("/me")
async def put_my_working_hours(
    payload: WorkingHours,
    current_user=Depends(get_current_user),
):
    return save_working_hours(current_user.sub, payload)
