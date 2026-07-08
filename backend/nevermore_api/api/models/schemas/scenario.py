from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class ScenarioIn(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool

class ScenarioOut(ScenarioIn):
    id: int
    is_owner: bool
    created_at: datetime

    class Config:
        from_attributes = True