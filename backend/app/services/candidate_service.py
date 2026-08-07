from app.database.mongo import get_collection
from app.utils.object_id import doc_id_to_str, to_object_id

COLLECTION = "candidates"


async def create_candidate(data: dict) -> dict:
    data["status"] = "NEW"
    collection = get_collection(COLLECTION)
    result = await collection.insert_one(data)
    doc = await collection.find_one({"_id": result.inserted_id})
    return doc_id_to_str(doc)


async def get_candidate(candidate_id: str) -> dict | None:
    collection = get_collection(COLLECTION)
    doc = await collection.find_one({"_id": to_object_id(candidate_id)})
    if not doc:
        return None
    return doc_id_to_str(doc)


async def list_candidates() -> list[dict]:
    collection = get_collection(COLLECTION)
    docs = await collection.find().to_list(length=None)
    return [doc_id_to_str(doc) for doc in docs]


async def update_candidate(candidate_id: str, data: dict) -> dict | None:
    data = {k: v for k, v in data.items() if v is not None}
    if not data:
        return await get_candidate(candidate_id)

    collection = get_collection(COLLECTION)
    await collection.update_one({"_id": to_object_id(candidate_id)}, {"$set": data})
    return await get_candidate(candidate_id)


async def update_candidate_status(candidate_id: str, status: str) -> None:
    collection = get_collection(COLLECTION)
    await collection.update_one({"_id": to_object_id(candidate_id)}, {"$set": {"status": status}})
