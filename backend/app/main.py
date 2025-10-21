import os
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .auth_cognito import verify_access_token

app = FastAPI(title="OfficeMate API")

# Support multiple origins via comma-separated env
origins = (os.getenv("FRONTEND_ORIGINS") or os.getenv("FRONTEND_ORIGIN") or "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def bearer(req: Request) -> str:
    h = req.headers.get("authorization") or req.headers.get("Authorization")
    if not h:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    parts = h.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header")
    return parts[1]

@app.get("/health")
def health():
    return {"ok": True}

# Example: identity endpoint (access token based)
@app.get("/me")
def me(access_token: str = Depends(bearer)):
    claims = verify_access_token(access_token)
    return {
        "sub": claims.get("sub"),
        "username": claims.get("username", ""),
        "scope": claims.get("scope", ""),
        "client_id": claims.get("client_id", ""),
    }

# Example: protect a route with required scopes
@app.get("/notes")
def list_notes(access_token: str = Depends(bearer)):
    # require 'notes.read' scope, adjust to your needs
    claims = verify_access_token(access_token, required_scopes=["notes.read"])
    return {"items": [], "user": claims.get("sub")}
