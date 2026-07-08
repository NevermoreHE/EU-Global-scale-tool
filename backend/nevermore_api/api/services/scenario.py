from typing import List
from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import requests

from api.constants import APIKEY_SIMVEN, URL_API_SIMVEN
from api.models.policy_item import PolicyItem
from api.models.schemas.scenario import ScenarioIn
from api.models.models import Scenario

def create_scenario(db: Session, user_id: str, data: ScenarioIn):
    exist_scenario = db.query(Scenario).filter(and_(Scenario.name == data.name, Scenario.user_id == user_id)).scalar()
    if exist_scenario:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Scenario name exists")
    
    try:
        scenario: Scenario = Scenario(
            name=data.name,
            description=data.description,
            user_id=user_id,
            is_public=data.is_public
        )
        db.add(scenario)
        db.commit()
        db.refresh(scenario)
        scenario.is_owner = str(scenario.user_id) == user_id
    except Exception as e:
        print(e)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Error creating scenario")
    
    return scenario

def get_scenarios(db: Session, user_id: str):
    try:
        scenarios = (
            db.query(Scenario)
                .filter(or_(Scenario.user_id == user_id, Scenario.is_public == True))
                .order_by(Scenario.name)
                .all()
        )

        for scenario in scenarios:
            scenario.is_owner = str(scenario.user_id) == user_id

        return scenarios
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Error getting scenarios")
    
def update_scenario(db: Session, user_id: str, id: int, data: ScenarioIn):
    try:
        scenario = get_scenario(db=db, user_id=user_id, id=id)
        scenario.name = data.name
        scenario.description = data.description
        scenario.is_public = data.is_public

        db.commit()

    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Error updating scenario")
    
def delete_scenario(db: Session, user_id: str, id: int):
    try:
        scenario = get_scenario(db=db, user_id=user_id, id=id)
        
        db.delete(scenario)
        db.commit()

    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Error deleting scenario")
    
def get_scenario(db: Session, user_id: str, id: int):
    try:
        scenario = (
            db.query(Scenario)
                .filter(Scenario.id == id)
                .first()
        )
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Error getting scenario")
    
    
    if scenario is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Scenario not found")
    
    if(not(str(scenario.user_id) == user_id)):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You are not the owner")

    return scenario

def save_policies(db: Session, user_id: str, id: int, policies: List[PolicyItem]):
    scenario = get_scenario(db=db, user_id=user_id, id=id)
    task = send_calculate_scenario(policies=policies)

    try:
        scenario.policies = [p.initial_value for p in policies]
        scenario.serie_hash = get_policies_hash(policies, db)
        scenario.taskid = task
        db.commit()
        db.refresh(scenario)

    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Error saving policies")
    
    return scenario
    
def get_policies_hash(politics: List[PolicyItem], db: Session):
    politics_values = ','.join(str(p.initial_value) for p in sorted(politics, key=lambda x: x.id_policy))
    return db.execute(func.md5(politics_values)).first()[0]

def send_calculate_scenario(policies: List[PolicyItem]):
    try:
        datos = [p.model_dump() for p in policies]
        headers = {
            "X-API-Key": APIKEY_SIMVEN
        }
        response = requests.post(URL_API_SIMVEN, headers=headers, json=datos)
        response.raise_for_status()
        task = response.json()
        return task
    except Exception as e:
        try:
            error_detail = response.json().get("detail", "")
        except Exception:
            error_detail = response.text
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"{error_detail}")
    