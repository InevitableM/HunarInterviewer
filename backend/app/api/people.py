from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_current_user
from app.schemas.people import EnrichRequest, EnrichResponse, PeopleSearchRequest, PersonOut, SearchHistoryOut
from app.services import people_service

router = APIRouter(prefix="/people", tags=["people"], dependencies=[Depends(get_current_user)])


@router.post("/search", response_model=list[PersonOut])
async def search_people(payload: PeopleSearchRequest):
    return await people_service.search_people(payload.job_title, payload.limit)


@router.post("/enrich", response_model=EnrichResponse)
async def enrich_person(payload: EnrichRequest):
    return await people_service.enrich_person(payload.person_id)


@router.get("/history", response_model=list[SearchHistoryOut])
async def search_history():
    return await people_service.list_search_history()


@router.get("/history/{search_id}", response_model=SearchHistoryOut)
async def get_search_history_item(search_id: str):
    doc = await people_service.get_search(search_id)
    if not doc:
        raise HTTPException(status_code=404, detail="search not found")
    return doc
