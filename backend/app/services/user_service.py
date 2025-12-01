from datetime import datetime, timezone
from typing import Optional, Dict

from app.core.ddb import users_table


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_user_by_id(user_id: str) -> Optional[Dict]:
    resp = users_table().get_item(Key={"userId": user_id})
    return resp.get("Item")


def upsert_user(
    user_id: str,
    email: str,
    name: Optional[str] = None,
    business_name: Optional[str] = None,
    location: Optional[str] = None,
    phone: Optional[str] = None,
) -> Dict:
    table = users_table()
    existing = get_user_by_id(user_id)
    t = now_iso()

    if existing:
        item = {
            **existing,
            "email": email or existing.get("email", ""),
            "name": name or existing.get("name", ""),
            "businessName": business_name or existing.get("businessName", ""),
            "location": location or existing.get("location", ""),
            "phone": phone or existing.get("phone", ""),
            "updatedAt": t,
        }
    else:
        item = {
            "userId": user_id,
            "email": email,
            "name": name or "",
            "businessName": business_name or "",
            "defaultBusinessId": None,
            "location": location or "",
            "phone": phone or "",
            "createdAt": t,
            "updatedAt": t,
        }

    table.put_item(Item=item)
    return item
