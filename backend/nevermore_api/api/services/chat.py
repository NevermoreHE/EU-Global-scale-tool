from typing import Optional
from fastapi import HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import json

from api.models.models import Chat
from api.models.schemas.chat import ChatIn
from api.dependencies import broadcast


async def save_message(db: Session, user_id: str, user_name: str, data: ChatIn):
    chat: Chat = Chat(
        texto=data.texto,
        user_id=user_id,
        user_name=user_name
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    await broadcast.publish(channel="chatroom", message=json.dumps(jsonable_encoder(chat)))

def get_messages(count: int, last: Optional[int], filter: Optional[str], db: Session):
    try:
        query = db.query(Chat)
        
        if last is not None:
            query = query.filter(Chat.id < last)

        if filter is not None:
            query = query.filter(Chat.texto.ilike(f"%{filter}%"))

        messages = (
            query
                .order_by(Chat.id.desc())
                .limit(count)
                .all()
        )

        return list(reversed(messages))
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Error getting messages")