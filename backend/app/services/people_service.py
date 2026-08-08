from datetime import datetime

import httpx
from fastapi import HTTPException

from app.config.settings import get_settings
from app.database.mongo import get_collection
from app.utils.object_id import doc_id_to_str, to_object_id

BASE_URL = "https://api.prospeo.io"
SEARCHES_COLLECTION = "people_searches"


def _headers():
    settings = get_settings()
    return {"X-KEY": settings.prospeo_api_key, "Content-Type": "application/json"}


async def search_people(job_title: str = None, limit: int = 10) -> list[dict]:
    filters = {}
    if job_title:
        filters["person_job_title"] = {"include": [job_title], "match_mode": "CONTAINS"}

    body = {"filters": filters, "page": 1}

    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{BASE_URL}/search-person", json=body, headers=_headers())
        if resp.status_code >= 400:
            raise HTTPException(status_code=resp.status_code, detail=resp.json())
        data = resp.json()

    people = []
    for r in data.get("results", [])[:limit]:
        person = r.get("person", {})
        company = r.get("company", {})
        people.append({
            "person_id": person.get("person_id"),
            "name": person.get("full_name"),
            "title": person.get("current_job_title"),
            "company": company.get("name"),
            "linkedin_url": person.get("linkedin_url"),
        })

    collection = get_collection(SEARCHES_COLLECTION)
    await collection.insert_one({
        "job_title": job_title,
        "results": people,
        "created_at": datetime.utcnow().isoformat(),
    })

    return people


async def list_search_history() -> list[dict]:
    collection = get_collection(SEARCHES_COLLECTION)
    docs = await collection.find().sort("_id", -1).to_list(length=None)
    return [doc_id_to_str(doc) for doc in docs]


async def get_search(search_id: str) -> dict | None:
    collection = get_collection(SEARCHES_COLLECTION)
    doc = await collection.find_one({"_id": to_object_id(search_id)})
    if not doc:
        return None
    return doc_id_to_str(doc)


async def enrich_person(person_id: str) -> dict:
    body = {"only_verified_mobile": True, "data": {"person_id": person_id}}

    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{BASE_URL}/enrich-person", json=body, headers=_headers())
        if resp.status_code >= 400:
            raise HTTPException(status_code=resp.status_code, detail=resp.json())
        data = resp.json()

    person = data.get("person", {})
    email = (person.get("email") or {}).get("email")
    phone = (person.get("mobile") or {}).get("mobile_international") or (person.get("mobile") or {}).get("mobile")

    return {"name": person.get("full_name"), "email": email, "phone": phone}
