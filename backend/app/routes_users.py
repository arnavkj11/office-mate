import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Body
from pydantic import BaseModel, validator
from .auth_cognito import verify_access_token
from .ddb import users_table, businesses_table

router = APIRouter(prefix="/api/users", tags=["users"])

class BootstrapIn(BaseModel):
    name: str
    email: str
    businessName: str
    phone: Optional[str] = ""
    location: Optional[str] = ""

    @validator("name", "email", "businessName", pre=True)
    def required_fields(cls, v):
        v = (v or "").strip()
        if not v:
            raise ValueError("Field required")
        return v

    @validator("phone", "location", pre=True, always=True)
    def optional_fields(cls, v):
        return (v or "").strip()

def bearer(req: Request) -> str:
    h = req.headers.get("authorization") or req.headers.get("Authorization")
    if not h:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    parts = h.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    return parts[1]

@router.get("/me")
def me(access_token: str = Depends(bearer)):
    claims = verify_access_token(access_token)
    sub = claims.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Missing Cognito sub")
    ut = users_table()
    item = ut.get_item(Key={"userId": sub}).get("Item")
    return {
        "userId": sub,
        "hasProfile": bool(item),
        "profile": item or None,
    }

@router.post("/bootstrap")
def bootstrap(payload: BootstrapIn = Body(...), access_token: str = Depends(bearer)):
    claims = verify_access_token(access_token)
    sub = claims.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Missing Cognito sub")

    now = datetime.now(timezone.utc).isoformat()
    ut = users_table()
    bt = businesses_table()

    existing = ut.get_item(Key={"userId": sub}).get("Item")
    if existing:
        return {
            "ok": True,
            "userId": sub,
            "alreadyExists": True,
        }

    business_id = str(uuid.uuid4())
    bt.put_item(
        Item={
            "businessId": business_id,
            "ownerUserId": sub,
            "businessName": payload.businessName,
            "location": payload.location,
            "createdAt": now,
        }
    )

    ut.put_item(
        Item={
            "userId": sub,
            "name": payload.name,
            "email": payload.email,
            "phone": payload.phone,
            "location": payload.location,
            "businessName": payload.businessName,
            "defaultBusinessId": business_id,
            "createdAt": now,
        }
    )

    return {"ok": True, "userId": sub}
