from dotenv import load_dotenv
from pathlib import Path
import os

from fastapi import FastAPI, HTTPException, status, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute

from app.agent import run_agent
from app.api.routes_users import router as users_router
from app.api.routes_businesses import router as businesses_router
from app.api.routes_appointments import router as appointments_router
from app.core.auth_cognito import get_current_user
from app.services.user_service import get_user_by_id

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

app = FastAPI(title="OfficeMate API")

origins_env = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
)
allow_origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"^http:\/\/(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True, "service": "officemate-api", "assistant_version": "chat-ddb-no-model"}

@app.post("/assistant/ui-chat")
async def assistant_ui_chat(request: Request, current_user=Depends(get_current_user)):
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON body",
        )

    message = data.get("message")
    history_raw = data.get("history") or []

    if not isinstance(message, str) or not message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'message' is required and must be a non-empty string.",
        )

    if not isinstance(history_raw, list):
        history_raw = []

    history = []
    for item in history_raw:
        if not isinstance(item, dict):
            continue
        r = item.get("role")
        c = item.get("content")
        if r not in ("user", "assistant", "system"):
            continue
        if not isinstance(c, str) or not c.strip():
            continue
        history.append({"role": r, "content": c})

    user_data = get_user_by_id(current_user.sub)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in database"
        )

    try:
        output = run_agent(
            user_message=message,
            history=history,
            current_user=user_data,
        )
        return {"output": output}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )

app.include_router(users_router)
app.include_router(businesses_router)
app.include_router(appointments_router)

for route in app.routes:
    if isinstance(route, APIRoute):
        print("ROUTE:", route.path, route.methods)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
