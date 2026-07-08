from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from api.dependencies import broadcast, websocket_authorization

router = APIRouter(prefix="/ws", tags=["Websocket"])

@router.websocket("/chat")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.headers.get("sec-websocket-protocol")

    await websocket_authorization(token)

    await websocket.accept(subprotocol=token) # importante pasar el protocolo
    async with broadcast.subscribe(channel="chatroom") as subscriber:
        try:
            async for event in subscriber:
                await websocket.send_text(event.message)
        except WebSocketDisconnect:
            print("Close connection")