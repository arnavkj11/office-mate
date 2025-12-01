from pydantic import BaseModel, EmailStr
from typing import Optional


class UserOut(BaseModel):
    userId: str
    email: EmailStr
    name: str
    businessName: Optional[str] = ""
    defaultBusinessId: Optional[str] = None
    location: Optional[str] = ""
    phone: Optional[str] = ""
    createdAt: str
