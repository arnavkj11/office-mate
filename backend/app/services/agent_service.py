from datetime import datetime, timezone
from boto3.dynamodb.conditions import Key, Attr
from app.core.ddb import appointments_table

def today_bounds():
    now = datetime.now(timezone.utc)
    start = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)
    end = datetime(now.year, now.month, now.day, 23, 59, 59, tzinfo=timezone.utc)
    return start.isoformat(), end.isoformat()

def get_today_appointments(user_id: str, business_id: str):
    start_iso, end_iso = today_bounds()
    table = appointments_table()
    
    resp = table.scan(
        FilterExpression=(
            Attr("businessId").eq(business_id)
            & Attr("userId").eq(user_id)
            & Attr("startTime").between(start_iso, end_iso)
        )
    )
    
    items = resp.get("Items", [])
    return {
        "date": start_iso[:10],
        "count": len(items),
        "appointments": items,
    }