import os
import httpx
from functools import lru_cache
from jose import jwt, JWTError
from fastapi import HTTPException, status
from typing import Optional, List

REGION = os.getenv("COG_REGION")
POOL = os.getenv("COG_USER_POOL_ID")
CLIENT = os.getenv("COG_CLIENT_ID")

if not (REGION and POOL and CLIENT):
    raise RuntimeError("Missing env: COG_REGION / COG_USER_POOL_ID / COG_CLIENT_ID")

ISSUER = f"https://cognito-idp.{REGION}.amazonaws.com/{POOL}"
JWKS_URL = f"{ISSUER}/.well-known/jwks.json"
ALGS = ["RS256"]

class AuthError(HTTPException):
    def __init__(self, detail="Unauthorized"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

@lru_cache(maxsize=1)
def get_jwks():
    try:
        with httpx.Client(timeout=5.0) as c:
            r = c.get(JWKS_URL)
            r.raise_for_status()
            data = r.json()
            if not isinstance(data.get("keys"), list):
                raise RuntimeError("JWKS payload invalid")
            return data
    except Exception as e:
        raise RuntimeError(f"Failed to fetch JWKS: {e}")

def _find_key(kid: str):
    for k in get_jwks()["keys"]:
        if k.get("kid") == kid:
            return k
    return None

def _require_scopes(token_scope: Optional[str], required_scopes: Optional[List[str]]) -> None:
    if not required_scopes:
        return
    present = set((token_scope or "").split())
    missing = [s for s in required_scopes if s not in present]
    if missing:
        raise AuthError(f"Missing scope(s): {' '.join(missing)}")

def verify_access_token(access_token: str, required_scopes: Optional[List[str]] = None) -> dict:
    if not access_token:
        raise AuthError("Missing token")
    try:
        hdr = jwt.get_unverified_header(access_token)
        kid = hdr.get("kid")
        if not kid:
            raise AuthError("Missing kid")
        key = _find_key(kid)
        if not key:
            raise AuthError("Key not found")
        claims = jwt.decode(
            access_token,
            key,
            algorithms=ALGS,
            audience=CLIENT,
            issuer=ISSUER,
            options={
                "require_exp": True,
                "verify_exp": True,
                "verify_iss": True,
                "verify_aud": True,
                "verify_iat": True,
            },
        )
        if claims.get("token_use") != "access":
            raise AuthError("Wrong token_use (expected 'access')")
        _require_scopes(claims.get("scope"), required_scopes)
        return claims
    except AuthError:
        raise
    except JWTError:
        raise AuthError("Invalid or expired token")
    except Exception as e:
        raise AuthError(f"Token verification error: {e}")
