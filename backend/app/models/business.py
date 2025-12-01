from pydantic import BaseModel
from typing import Optional


class BusinessCreate(BaseModel):
    businessName: str
    location: Optional[str] = ""


class BusinessOut(BaseModel):
    businessId: str
    ownerUserId: str
    businessName: str
    location: Optional[str] = ""
    createdAt: str
