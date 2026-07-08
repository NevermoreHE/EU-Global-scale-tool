from pydantic import BaseModel

from datetime import datetime

class ChatIn(BaseModel):
    texto: str

class ChatOut(ChatIn):
    id: int
    user_name: str
    created_at: datetime
    # user_id: str

    class Config:
        from_attributes = True