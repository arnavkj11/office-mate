from pydantic import BaseModel, EmailStr
from typing import Optional, List


class AppointmentCreate(BaseModel):
    title: str
    email: EmailStr
    start_time: str
    end_time: str
    location: Optional[str] = ""
    notes: Optional[str] = ""


class AppointmentOut(BaseModel):
    appointmentId: str
    businessId: str
    userId: str
    title: str
    inviteeEmail: EmailStr
    startTime: str
    endTime: str
    location: str
    notes: str
    status: str
    createdAt: str
    updatedAt: str


class AppointmentList(BaseModel):
    items: List[AppointmentOut]
