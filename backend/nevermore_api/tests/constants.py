from os import getenv
from dotenv import load_dotenv

from api.constants import KEYCLOAK_AUTH_URL, KEYCLOAK_REALM_ID

load_dotenv()

KEYCLOAK_USER = getenv("KEYCLOAK_USER")
KEYCLOAK_PASSWORD = getenv("KEYCLOAK_PASSWORD")
KEYCLOAK_CLIENT_ID_LOGIN = getenv("KEYCLOAK_CLIENT_ID_LOGIN")

KEYCLOAK_SWAGGER_AUTH_URL = (
    KEYCLOAK_AUTH_URL + "realms/" + KEYCLOAK_REALM_ID + "/protocol/openid-connect/token"
)