from typing import Any, Optional, Mapping, cast, Dict
from botocore.exceptions import ClientError

from app.core.ddb import users_table
from app.models.working_hours import WorkingHours

ATTR = "working_hours"


def _get_table_keys() -> Dict[str, Optional[str]]:
    table = users_table()
    pk = None
    sk = None
    for k in table.key_schema:
        if k.get("KeyType") == "HASH":
            pk = k.get("AttributeName")
        elif k.get("KeyType") == "RANGE":
            sk = k.get("AttributeName")
    return {"pk": pk, "sk": sk}


def _make_key(user_sub: str) -> Dict[str, Any]:
    keys = _get_table_keys()
    pk = keys["pk"]
    sk = keys["sk"]

    if not pk:
        raise RuntimeError("DynamoDB users table has no HASH key")

    key: Dict[str, Any] = {pk: user_sub}

    if sk:
        raise RuntimeError(
            f"DynamoDB users table has a sort key '{sk}'. "
            "Update _make_key() to supply the sort key value."
        )

    return key


def get_working_hours(user_sub: str) -> Optional[Mapping[str, Any]]:
    table = users_table()
    try:
        res = table.get_item(Key=_make_key(user_sub))
    except ClientError as e:
        raise RuntimeError(str(e))

    item_any = res.get("Item")
    if not isinstance(item_any, dict):
        return None

    wh_any = item_any.get(ATTR)
    if not isinstance(wh_any, dict):
        return None

    return cast(Mapping[str, Any], wh_any)


def save_working_hours(user_sub: str, wh: WorkingHours) -> Mapping[str, Any]:
    table = users_table()
    data = wh.model_dump(mode="json")

    try:
        table.update_item(
            Key=_make_key(user_sub),
            UpdateExpression=f"SET {ATTR} = :wh",
            ExpressionAttributeValues={":wh": data},
        )
    except ClientError as e:
        raise RuntimeError(str(e))

    return data
