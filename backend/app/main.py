import os
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .auth_cognito import verify_access_token
from .routes_users import router as users_router
from .settings import FRONTEND_ORIGINS, PORT

# --- OpenAI setup ---
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


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


# --- New agent route ---
@app.post("/agent/run")
async def agent_run(payload: AgentPrompt):
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": payload.message}],
        )
        content = resp.choices[0].message.content
        return {"output": content}
    except Exception as e:
        # log if you want: print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Agent error",
        )


# include all user-related routes under /api/users
app.include_router(users_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT, reload=True)
