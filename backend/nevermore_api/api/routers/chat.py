from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from api.dependencies import get_database, authorization
from api.models.schemas.chat import ChatIn, ChatOut
from api.models.schemas.token_data import TokenData
from api.services.chat import (
    get_messages as get_messages_service,
    save_message as save_message_service
)


router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def save_message(
    data: ChatIn,
    token: TokenData = Depends(authorization),
    db: Session = Depends(get_database)
):
    user_id = token.sub
    user_name = token.preferred_username
    return await save_message_service(db=db, user_id=user_id, user_name=user_name, data=data)


@router.get("", response_model=List[ChatOut])
async def get_messages(
    count: Annotated[int, Query(le=100)],
    last: Optional[int]=None,
    filter: Optional[str]=None,
    token: TokenData = Depends(authorization),
    db: Session = Depends(get_database)
):
    return get_messages_service(count=count, last=last, filter=filter, db=db)