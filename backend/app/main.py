from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import auth, candidate, dashboard, interview, people, webhook
from app.database.mongo import close_mongo_connection, connect_to_mongo


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongo()
    yield
    close_mongo_connection()


app = FastAPI(title="Hunar Interviewer", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(candidate.router)
app.include_router(interview.router)
app.include_router(webhook.router)
app.include_router(people.router)
app.include_router(dashboard.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
