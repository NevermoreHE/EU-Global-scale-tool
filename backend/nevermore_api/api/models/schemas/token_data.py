from typing import Optional
from pydantic import BaseModel


class TokenData(BaseModel):
    sub: Optional[str] = None
    preferred_username: Optional[str] = None
    active: bool = False