from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBootstrapIn(BaseModel):
    name: str
    businessName: str
    email: EmailStr
    phone: Optional[str] = ""
    location: Optional[str] = ""

class UserOut(BaseModel):
    userId: str
    email: EmailStr
    name: str
    businessName: str
    defaultBusinessId: Optional[str]
    location: str
    phone: str
    createdAt: str
