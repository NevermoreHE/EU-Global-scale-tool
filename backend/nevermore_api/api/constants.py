from os import getenv
from dotenv import load_dotenv

load_dotenv()

# CORS_ORIGINS
CORS_ORIGINS = getenv("CORS_ORIGINS").split(",")

# DATABASE
SQLALCHEMY_DATABASE_URL = (
    "postgresql://"
    + getenv("DB_USER")
    + ":"
    + getenv("DB_PASSWORD")
    + "@"
    + getenv("DB_HOST")
    + "/"
    + getenv("DB_DATABASE")
)

# REDIS
REDIS_URL = getenv("REDIS_URL")

# KEYCLOAK
KEYCLOAK_BASE_URL = getenv("KEYCLOAK_BASE_URL")
KEYCLOAK_REALM_ID = getenv("KEYCLOAK_REALM_ID")
KEYCLOAK_CLIENT_ID_BACK = getenv("KEYCLOAK_CLIENT_ID_BACK")
KEYCLOAK_SECRET_KEY_BACK = getenv("KEYCLOAK_SECRET_KEY_BACK")
KEYCLOAK_AUTH_URL=KEYCLOAK_BASE_URL+"/"

KEYCLOAK_TOKEN_AUTH_URL= "/".join(
    [
        KEYCLOAK_BASE_URL,
        "realms",
        KEYCLOAK_REALM_ID,
        "protocol",
        "openid-connect",
        "token",
    ]
)

URL_API_SIMVEN = getenv("URL_API_SIMVEN")
APIKEY_SIMVEN = getenv("APIKEY_SIMVEN")