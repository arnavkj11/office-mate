from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.core.auth_cognito import get_current_user, AuthUser
from app.models.business import BusinessCreate, BusinessOut
from app.services.user_service import get_user_by_id
from app.services.business_service import create_business_for_user, list_businesses_for_user

router = APIRouter(prefix="/businesses", tags=["businesses"])


def _load_user_item(user: AuthUser):
    item: Optional[dict] = get_user_by_id(user.sub)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return item


def _item_to_business_out(item: dict) -> BusinessOut:
    return BusinessOut(
        businessId=item["businessId"],
        ownerUserId=item["ownerUserId"],
        businessName=item["businessName"],
        location=item.get("location", ""),
        createdAt=item.get("createdAt", ""),
    )


@router.post("", response_model=BusinessOut)
def create_business(
    payload: BusinessCreate,
    user: AuthUser = Depends(get_current_user),
) -> BusinessOut:
    user_item = _load_user_item(user)
    item = create_business_for_user(user_item, payload)
    return _item_to_business_out(item)


@router.get("", response_model=List[BusinessOut])
def list_businesses(
    user: AuthUser = Depends(get_current_user),
) -> List[BusinessOut]:
    items = list_businesses_for_user(user.sub)
    return [_item_to_business_out(i) for i in items]
