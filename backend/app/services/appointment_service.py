from uuid import uuid4
from datetime import datetime, timezone
from typing import Dict, List

from app.core.ddb import appointments_table
from app.models.appointment import AppointmentCreate


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_appointment(user_item: Dict, payload: AppointmentCreate) -> Dict:
    if not user_item.get("defaultBusinessId"):
        raise ValueError("User has no default business configured")

    t = now_iso()

    item = {
        "appointmentId": str(uuid4()),
        "businessId": user_item["defaultBusinessId"],
        "userId": user_item["userId"],
        "title": payload.title.strip(),
        "inviteeEmail": payload.email.strip(),
        "startTime": payload.start_time,
        "endTime": payload.end_time,
        "location": (payload.location or "").strip(),
        "notes": (payload.notes or "").strip(),
        "status": "pending",
        "createdAt": t,
        "updatedAt": t,
    }

    appointments_table().put_item(Item=item)
    return item


def list_appointments_for_business(business_id: str) -> List[Dict]:
    resp = appointments_table().scan()
    items = resp.get("Items", [])
    return [i for i in items if i.get("businessId") == business_id]


def list_appointments_for_user(user_id: str) -> List[Dict]:
    resp = appointments_table().scan()
    items = resp.get("Items", [])
    return [i for i in items if i.get("userId") == user_id]
