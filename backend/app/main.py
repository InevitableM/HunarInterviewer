from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, candidate, dashboard, interview, people, webhook
from app.database.mongo import close_mongo_connection, connect_to_mongo


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongo()
    yield
    close_mongo_connection()


app = FastAPI(title="Hunar Interviewer", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(candidate.router)
app.include_router(interview.router)
app.include_router(webhook.router)
app.include_router(people.router)
app.include_router(dashboard.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
