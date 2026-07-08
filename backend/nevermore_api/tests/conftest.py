import pytest
from fastapi.testclient import TestClient
import requests

from api.constants import KEYCLOAK_SECRET_KEY_BACK
from api.main import app as my_app
from tests.constants import KEYCLOAK_CLIENT_ID_LOGIN, KEYCLOAK_PASSWORD, KEYCLOAK_SWAGGER_AUTH_URL, KEYCLOAK_USER

@pytest.fixture()
def app():
    yield my_app

@pytest.fixture()
def client(app):
    return TestClient(app)

def auth():
    response = requests.post(
        KEYCLOAK_SWAGGER_AUTH_URL,
        data={
            "grant_type": "password",
            "client_id": KEYCLOAK_CLIENT_ID_LOGIN,
            "client_secret": KEYCLOAK_SECRET_KEY_BACK,
            "username": KEYCLOAK_USER,
            "password": KEYCLOAK_PASSWORD,
        },
    )
    if response.status_code == 200:
        token = response.json()["access_token"]
        return {"Authorization": "Bearer " + token}