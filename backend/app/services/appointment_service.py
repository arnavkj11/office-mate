from uuid import uuid4
from datetime import datetime, timezone
from typing import Dict, List

from boto3.dynamodb.conditions import Key, Attr

from app.core.ddb import appointments_table
from app.models.appointment import AppointmentCreate


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_appointment(user_item: Dict, payload: AppointmentCreate) -> Dict:
    t = now_iso()

    item = {
        "businessId": user_item["defaultBusinessId"],
        "appointmentId": str(uuid4()),
        "userId": user_item["userId"],
        "title": payload.title.strip(),
        "clientName": payload.client_name.strip(),
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
    resp = appointments_table().query(
        KeyConditionExpression=Key("businessId").eq(business_id)
    )
    return resp.get("Items", [])


def list_appointments_for_user(user_id: str) -> List[Dict]:
    resp = appointments_table().scan()
    items = resp.get("Items", [])
    return [i for i in items if i.get("userId") == user_id]


def search_appointments_by_client_name(business_id: str, name: str) -> List[Dict]:
    resp = appointments_table().scan(
        FilterExpression=Attr("businessId").eq(business_id) &
                         Attr("clientName").contains(name)
    )
    return resp.get("Items", [])
