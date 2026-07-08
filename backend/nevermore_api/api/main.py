from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware


import api.routers.values as values
import api.routers.scenario as scenario
import api.routers.chat as chat
import api.routers.websocket as websocket
from api.constants import CORS_ORIGINS
from api.dependencies import broadcast

app = FastAPI(on_startup=[broadcast.connect], on_shutdown=[broadcast.disconnect])

# Config app middlewares (gzip and CORS)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include endpoints routers
app.include_router(values.router)
app.include_router(scenario.router)
app.include_router(chat.router)
app.include_router(websocket.router)