def test_read_swagger(client):
    response = client.get("/docs")
    assert response.status_code == 200