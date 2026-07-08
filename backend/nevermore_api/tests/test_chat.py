from api.models.schemas.chat import ChatIn
from tests.conftest import auth


header = auth()

path_chat = "/chat"


def test_chat_send_message(client):
    response = client.post(
        path_chat,
        headers=header,
        json=(ChatIn(**({"texto": "Mensaje desde tester"})).model_dump()),
    )
    assert response.status_code == 201


def test_get_chat(client):
    count = 10
    filter = f"?count={count}"
    response = client.get(path_chat + filter, headers=header)
    assert response.status_code == 200
    data = response.json()
    assert data[-1]["texto"] == "Mensaje desde tester"

    last = 10
    filter = f"?count={count}&last={last}"
    response = client.get(path_chat + filter, headers=header)
    assert response.status_code == 200

    filter = f"?count={count}&&filter=Mensaje desde tester"
    response = client.get(path_chat + filter, headers=header)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

