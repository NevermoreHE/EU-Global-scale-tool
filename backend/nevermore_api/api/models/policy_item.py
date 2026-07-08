from pydantic import BaseModel

class PolicyItem(BaseModel):
    variable: str
    initial_value: float
    id_policy: int