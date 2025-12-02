from app.services.agent_service import get_today_appointments

def tool_get_today_appointments(current_user):
    return get_today_appointments(
        user_id=current_user["userId"],
        business_id=current_user["defaultBusinessId"],
    )

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_today_appointments",
            "description": "Return all appointments for today for the current user.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
                "additionalProperties": False,
            },
        },
    }
]
