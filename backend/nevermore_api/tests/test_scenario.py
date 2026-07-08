from api.models.schemas.scenario import ScenarioIn
from tests.conftest import auth
from httpx import Response

header = auth()

path_scenario = "/scenario"
id = None
path_scenario_id = None


def test_create_scenario(client):
    response = client.post(
        path_scenario,
        headers=header,
        json=(
            ScenarioIn(
                **(
                    {
                        "name": "Scenario tester",
                        "description": "Scenario tester description",
                        "is_public": False,
                    }
                )
            ).model_dump()
        ),
    )
    assert response.status_code == 201
    save_id(response)
    data = response.json()
    assert data["name"] == "Scenario tester"
    assert data["is_public"] == False


def test_update_scenario(client):
    response = client.put(
        path_scenario_id,
        headers=header,
        json=(
            ScenarioIn(
                **(
                    {
                        "name": "Scenario tester modificado",
                        "description": "Scenario tester modificado description",
                        "is_public": False,
                    }
                )
            ).model_dump()
        ),
    )
    assert response.status_code == 200

def test_get_scenarios(client):
    response = client.get(path_scenario, headers=header)
    assert response.status_code == 200

def test_delete_scenario(client):
    response = client.delete(path_scenario_id, headers=header)
    assert response.status_code == 200


def save_id(response: Response):
    global id
    id = response.json()["id"]

    global path_scenario_id
    path_scenario_id = f"{path_scenario}/{str(id)}"
