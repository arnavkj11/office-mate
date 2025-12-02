from fastapi import APIRouter, Depends
from app.core.auth_cognito import get_current_user
from app.services.agent_service import get_today_appointments

router = APIRouter(prefix="/agent", tags=["Agent"])

@router.get("/appointments-today")
def appointments_today(current_user=Depends(get_current_user)):
    user_id = current_user["userId"]
    business_id = current_user["defaultBusinessId"]
    data = get_today_appointments(user_id=user_id, business_id=business_id)
    return {
        "date": data["date"],
        "count": data["count"],
        "appointments": data["appointments"],
        "userId": user_id,
        "businessId": business_id,
    }
