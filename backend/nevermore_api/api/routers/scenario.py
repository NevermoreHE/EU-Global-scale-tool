from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from api.dependencies import authorization, get_database
from api.models.policy_item import PolicyItem
from api.models.schemas.scenario import ScenarioIn, ScenarioOut
from api.models.schemas.token_data import TokenData
from api.services.scenario import (
    create_scenario as create_scenario_service,
    get_scenarios as get_scenarios_service,
    get_scenario as get_scenario_service,
    delete_scenario as delete_scenario_service,
    update_scenario as update_scenario_service,
    save_policies as save_policies_service
)


router = APIRouter(prefix="/scenario", tags=["Scenario"])

@router.post("", response_model=ScenarioOut, status_code=status.HTTP_201_CREATED)
async def create_scenario(
    data: ScenarioIn,
    token: TokenData = Depends(authorization),
    db: Session = Depends(get_database)
):
    user_id = token.sub
    return create_scenario_service(db=db, user_id=user_id, data=data)

@router.get("", response_model=List[ScenarioOut])
async def get_scenarios(
    token: TokenData = Depends(authorization),
    db: Session = Depends(get_database)
):
    user_id = token.sub
    return get_scenarios_service(db=db, user_id=user_id)

@router.get("/{id}")
async def get_scenario(
    id: int,
    token: TokenData = Depends(authorization),
    db: Session = Depends(get_database)
):
    user_id = token.sub
    return get_scenario_service(db=db, user_id=user_id, id=id)

@router.put("/{id}")
async def update_scenario(
    id: int,
    data: ScenarioIn,
    token: TokenData = Depends(authorization),
    db: Session = Depends(get_database)
):
    user_id = token.sub
    update_scenario_service(db=db, user_id=user_id, id=id, data=data)

@router.delete("/{id}")
async def delete_scenario(
    id: int,
    token: TokenData = Depends(authorization),
    db: Session = Depends(get_database)
):
    user_id = token.sub
    delete_scenario_service(db=db, user_id=user_id, id=id)

@router.put("/{id}/policies")
async def save_policies(
    id: int,
    policies: List[PolicyItem],
    token: TokenData = Depends(authorization),
    db: Session = Depends(get_database)
):
    user_id = token.sub
    return save_policies_service(db=db, user_id=user_id, id=id, policies=policies)