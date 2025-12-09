from uuid import uuid4
from datetime import datetime, timezone
from typing import Dict, List, Optional

from boto3.dynamodb.conditions import Key

from app.core.ddb import appointments_table
from app.models.appointment import AppointmentCreate
from app.services.notification_service import send_appointment_email


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_appointment(user_item: Dict, payload: AppointmentCreate) -> Dict:
    if not user_item.get("defaultBusinessId"):
        raise ValueError("User has no default business")

    t = now_iso()

    client_name = payload.client_name.strip() if getattr(payload, "client_name", None) else ""

    item = {
        "appointmentId": str(uuid4()),
        "businessId": user_item["defaultBusinessId"],
        "userId": user_item["userId"],
        "title": payload.title.strip(),
        "clientName": client_name,
        "inviteeEmail": payload.email.strip(),
        "startTime": payload.start_time,
        "endTime": payload.end_time,
        "location": (payload.location or "").strip(),
        "notes": (payload.notes or "").strip(),
        "status": "pending",
        "rsvpToken": str(uuid4()),
        "createdAt": t,
        "updatedAt": t,
    }

    appointments_table().put_item(Item=item)

    try:
        send_appointment_email(item)
    except Exception as e:
        print("Failed to send appointment email:", repr(e))

    return item


def list_appointments_for_business(business_id: str) -> List[Dict]:
    table = appointments_table()
    resp = table.query(
        KeyConditionExpression=Key("businessId").eq(business_id)
    )
    return resp.get("Items", [])


def get_appointment_by_id(business_id: str, appointment_id: str) -> Optional[Dict]:
    table = appointments_table()
    resp = table.get_item(
        Key={"businessId": business_id, "appointmentId": appointment_id}
    )
    return resp.get("Item")


def update_appointment_status(business_id: str, appointment_id: str, status: str) -> Optional[Dict]:
    table = appointments_table()
    t = now_iso()
    table.update_item(
        Key={"businessId": business_id, "appointmentId": appointment_id},
        UpdateExpression="SET #s = :s, updatedAt = :u",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":s": status, ":u": t},
    )
    return get_appointment_by_id(business_id, appointment_id)
