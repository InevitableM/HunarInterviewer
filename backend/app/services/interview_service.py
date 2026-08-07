from datetime import datetime

from fastapi import HTTPException

from app.config.settings import get_settings
from app.database.mongo import get_collection
from app.services import candidate_service, hunar_service
from app.utils.object_id import doc_id_to_str, to_object_id

COLLECTION = "interviews"


async def start_interview(candidate_id: str) -> dict:
    candidate = await candidate_service.get_candidate(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="candidate not found")

    settings = get_settings()
    call = await hunar_service.start_call(candidate["name"], candidate["phone"])

    interview = {
        "candidate_id": candidate_id,
        "agent_id": settings.hunar_agent_id,
        "hunar_call_id": call["id"],
        "status": call.get("status", "NOT_STARTED"),
        "started_at": None,
        "ended_at": None,
    }

    collection = get_collection(COLLECTION)
    result = await collection.insert_one(interview)
    doc = await collection.find_one({"_id": result.inserted_id})

    await candidate_service.update_candidate_status(candidate_id, "CONTACTED")

    return doc_id_to_str(doc)


async def get_interview(interview_id: str) -> dict | None:
    collection = get_collection(COLLECTION)
    doc = await collection.find_one({"_id": to_object_id(interview_id)})
    if not doc:
        return None
    return doc_id_to_str(doc)


async def get_by_call_id(call_id: str) -> dict | None:
    collection = get_collection(COLLECTION)
    doc = await collection.find_one({"hunar_call_id": call_id})
    if not doc:
        return None
    return doc_id_to_str(doc)


async def list_interviews(candidate_id: str | None = None) -> list[dict]:
    collection = get_collection(COLLECTION)
    query = {"candidate_id": candidate_id} if candidate_id else {}
    docs = await collection.find(query).to_list(length=None)
    return [doc_id_to_str(doc) for doc in docs]


async def update_status(call_id: str, status: str, started_at: str = None, ended_at: str = None) -> None:
    update = {"status": status}
    if started_at:
        update["started_at"] = started_at
    if ended_at:
        update["ended_at"] = ended_at

    collection = get_collection(COLLECTION)
    await collection.update_one({"hunar_call_id": call_id}, {"$set": update})
