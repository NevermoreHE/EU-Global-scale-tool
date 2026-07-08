from broadcaster import Broadcast
from fastapi import Depends, HTTPException, WebSocket, status
from fastapi.security import OAuth2PasswordBearer
from keycloak import KeycloakOpenID

from api.constants import KEYCLOAK_AUTH_URL, KEYCLOAK_CLIENT_ID_BACK, KEYCLOAK_REALM_ID, KEYCLOAK_SECRET_KEY_BACK, KEYCLOAK_TOKEN_AUTH_URL, REDIS_URL
from api.database import SessionLocal
from api.models.schemas.token_data import TokenData

def get_database():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

broadcast = Broadcast(REDIS_URL)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=KEYCLOAK_TOKEN_AUTH_URL)

keycloak_openid = KeycloakOpenID(
    server_url=KEYCLOAK_AUTH_URL,
    client_id=KEYCLOAK_CLIENT_ID_BACK,
    realm_name=KEYCLOAK_REALM_ID,
    client_secret_key=KEYCLOAK_SECRET_KEY_BACK,
    verify=True,
)

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials"
)

def get_query_token(token: str = Depends(oauth2_scheme)):
    return TokenData.model_validate(keycloak_openid.introspect(token))

def authorization(token: TokenData = Depends(get_query_token)):
    if token is None:
        raise credentials_exception

    if token.active == False:
        raise credentials_exception

    return token


async def websocket_authorization(token: str):
    try:
        token_data = TokenData.model_validate(keycloak_openid.introspect(token))

        if not token_data.active:
            raise credentials_exception
    except Exception as e:
        raise credentials_exception