import os
import json
from typing import Dict, Any, List

from dotenv import load_dotenv
from openai import OpenAI
from openai.types.chat import (
    ChatCompletionMessageParam,
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam,
    ChatCompletionAssistantMessageParam,
)

from app.services.agent_service import get_today_appointments

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def system_msg(content: str) -> ChatCompletionSystemMessageParam:
    return {"role": "system", "content": content}

def user_msg(content: str) -> ChatCompletionUserMessageParam:
    return {"role": "user", "content": content}

def assistant_msg(content: str) -> ChatCompletionAssistantMessageParam:
    return {"role": "assistant", "content": content}

def build_base_messages(history: List[Dict[str, str]]) -> List[ChatCompletionMessageParam]:
    messages: List[ChatCompletionMessageParam] = [
        system_msg(
            "You are OfficeMate Assistant for a scheduling app. "
            "You can answer general questions and talk about the user's appointments "
            "when given backend data."
        )
    ]
    for h in history:
        r = h.get("role")
        c = h.get("content")
        if not isinstance(c, str) or not c.strip():
            continue
        if r == "user":
            messages.append(user_msg(c))
        elif r == "assistant":
            messages.append(assistant_msg(c))
        elif r == "system":
            messages.append(system_msg(c))
    return messages

def build_appointments_context(current_user: Dict[str, Any]) -> Dict[str, Any]:
    data = get_today_appointments(
        user_id=current_user["userId"],
        business_id=current_user["defaultBusinessId"],
    )
    return {
        "date": data["date"],
        "count": data["count"],
        "appointments": data["appointments"],
    }

def run_agent(
    user_message: str,
    history: List[Dict[str, str]],
    current_user: Dict[str, Any],
) -> str:
    txt = user_message.lower()
    messages = build_base_messages(history)

    if "appointment" in txt and "today" in txt:
        summary = build_appointments_context(current_user)
        messages.append(
            system_msg(
                "You have the user's appointments for today as JSON. "
                "If zero, say no appointments. If present, list each with time, "
                "title, and location."
            )
        )
        messages.append(system_msg(json.dumps(summary)))

    messages.append(user_msg(user_message))

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
    )
    return resp.choices[0].message.content or ""
