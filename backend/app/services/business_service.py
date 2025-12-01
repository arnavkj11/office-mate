from datetime import datetime, timezone
from typing import Dict, List

from app.core.ddb import businesses_table, users_table
from app.models.business import BusinessCreate


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_business_for_user(user_item: Dict, payload: BusinessCreate) -> Dict:
    table = businesses_table()
    t = now_iso()

    business_id = f"biz_{user_item['userId']}_{int(datetime.now().timestamp())}"

    item = {
        "businessId": business_id,
        "ownerUserId": user_item["userId"],
        "businessName": payload.businessName.strip(),
        "location": (payload.location or user_item.get("location") or "").strip(),
        "createdAt": t,
        "updatedAt": t,
    }

    table.put_item(Item=item)

    users_table().update_item(
        Key={"userId": user_item["userId"]},
        UpdateExpression="SET defaultBusinessId = :b, updatedAt = :u",
        ExpressionAttributeValues={":b": business_id, ":u": t},
    )

    return item


def list_businesses_for_user(user_id: str) -> List[Dict]:
    resp = businesses_table().scan()
    items = resp.get("Items", [])
    return [b for b in items if b.get("ownerUserId") == user_id]
