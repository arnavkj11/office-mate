from datetime import datetime, timezone
from typing import Optional, Dict

from app.core.ddb import users_table
from app.models.user import UserBootstrapIn
from app.models.business import BusinessCreate
from app.services.business_service import (
    find_business_by_name,
    create_business_for_user,
    set_default_business_for_user,
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_user_by_id(user_id: str) -> Optional[Dict]:
    resp = users_table().get_item(Key={"userId": user_id})
    return resp.get("Item")


def bootstrap_user(user_id: str, payload: UserBootstrapIn) -> Dict:
    table = users_table()
    existing = get_user_by_id(user_id)
    t = now_iso()

    if existing:
        user_item = {
            **existing,
            "email": payload.email,
            "name": payload.name,
            "businessName": payload.businessName,
            "location": payload.location or "",
            "phone": payload.phone or "",
            "updatedAt": t,
        }
    else:
        user_item = {
            "userId": user_id,
            "email": payload.email,
            "name": payload.name,
            "businessName": payload.businessName,
            "location": payload.location or "",
            "phone": payload.phone or "",
            "defaultBusinessId": None,
            "createdAt": t,
            "updatedAt": t,
        }

    table.put_item(Item=user_item)

    business = find_business_by_name(payload.businessName)

    if business:
        business_id = business["businessId"]
        set_default_business_for_user(user_id, business_id)
    else:
        business_payload = BusinessCreate(
            businessName=payload.businessName,
            location=payload.location or "",
        )
        business = create_business_for_user(user_item, business_payload)
        business_id = business["businessId"]

    user_item["defaultBusinessId"] = business_id

    final_user = get_user_by_id(user_id)
    return final_user or user_item
