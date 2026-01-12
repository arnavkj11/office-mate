from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
from datetime import date
import re

DayName = Literal[
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
]

_TIME_RE = re.compile(r"^\d{2}:\d{2}$")


def _to_minutes(t: str) -> int:
    h, m = t.split(":")
    return int(h) * 60 + int(m)


class WeeklyWorkingDay(BaseModel):
    day: DayName
    enabled: bool = True
    start: str = "09:00"
    end: str = "17:00"

    @field_validator("start", "end")
    @classmethod
    def validate_time(cls, v: str):
        if not _TIME_RE.match(v):
            raise ValueError("Time must be HH:MM")
        return v

    @field_validator("end")
    @classmethod
    def validate_range(cls, end: str, info):
        data = info.data
        if data.get("enabled") and _to_minutes(end) <= _to_minutes(data["start"]):
            raise ValueError("End must be after start")
        return end


class DateOverride(BaseModel):
    date: date
    enabled: bool = True
    start: Optional[str] = None
    end: Optional[str] = None

    @field_validator("start", "end")
    @classmethod
    def validate_time_optional(cls, v: Optional[str]):
        if v is None:
            return v
        if not _TIME_RE.match(v):
            raise ValueError("Time must be HH:MM")
        return v

    @field_validator("end")
    @classmethod
    def validate_override_range(cls, end: Optional[str], info):
        data = info.data
        if data.get("enabled"):
            if not data.get("start") or not end:
                raise ValueError("start and end required when enabled")
            if _to_minutes(end) <= _to_minutes(data["start"]):
                raise ValueError("End must be after start")
        return end


class WorkingHours(BaseModel):
    timezone: str = Field(default="America/Los_Angeles")
    weekly: List[WeeklyWorkingDay]
    overrides: List[DateOverride] = Field(default_factory=list)

    @field_validator("weekly")
    @classmethod
    def validate_week(cls, weekly):
        days = {d.day for d in weekly}
        if len(days) != 7:
            raise ValueError("weekly must contain all 7 days exactly once")
        return weekly
