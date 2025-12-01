from dotenv import load_dotenv
from pathlib import Path
import os

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.agent import run_agent
from app.api.routes_users import router as users_router
from app.api.routes_businesses import router as businesses_router
from app.api.routes_appointments import router as appointments_router

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class AgentPrompt(BaseModel):
  message: str


app = FastAPI(title="OfficeMate API")

origins_env = os.getenv(
  "FRONTEND_ORIGINS",
  "http://localhost:5173,http://127.0.0.1:5173",
)
allow_origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
  CORSMiddleware,
  allow_origins=allow_origins,
  allow_credentials=True,
  allow_methods=["GET", "POST", "OPTIONS"],
  allow_headers=["Authorization", "Content-Type", "Accept"],
)


@app.get("/health")
def health():
  return {"ok": True}


@app.post("/agent/run")
async def agent_run_endpoint(payload: AgentPrompt):
  try:
    output = run_agent(payload.message)
    return {"output": output}
  except Exception:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Agent error",
    )


app.include_router(users_router)
app.include_router(businesses_router)
app.include_router(appointments_router)


if __name__ == "__main__":
  import uvicorn

  port = int(os.getenv("PORT", "8000"))
  uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
