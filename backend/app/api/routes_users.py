from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from app.core.auth_cognito import get_current_user, AuthUser
from app.models.user import UserOut, UserBootstrapIn
from app.services.user_service import get_user_by_id, bootstrap_user

router = APIRouter(prefix="/users", tags=["users"])

def _item_to_user_out(item: dict) -> UserOut:
    return UserOut(
        userId=item["userId"],
        email=item["email"],
        name=item.get("name", ""),
        businessName=item.get("businessName", ""),
        defaultBusinessId=item.get("defaultBusinessId"),
        location=item.get("location", ""),
        phone=item.get("phone", ""),
        createdAt=item.get("createdAt", ""),
    )

@router.get("/me", response_model=UserOut)
def get_me(user: AuthUser = Depends(get_current_user)) -> UserOut:
    item: Optional[dict] = get_user_by_id(user.sub)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _item_to_user_out(item)

@router.post("/bootstrap", response_model=UserOut)
def bootstrap(payload: UserBootstrapIn, user: AuthUser = Depends(get_current_user)) -> UserOut:
    item = bootstrap_user(user_id=user.sub, payload=payload)
    return _item_to_user_out(item)
