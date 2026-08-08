from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.schemas.people import EnrichRequest, EnrichResponse, PeopleSearchRequest, PersonOut
from app.services import people_service

router = APIRouter(prefix="/people", tags=["people"], dependencies=[Depends(get_current_user)])


@router.post("/search", response_model=list[PersonOut])
async def search_people(payload: PeopleSearchRequest):
    return await people_service.search_people(payload.job_title, payload.limit)


@router.post("/enrich", response_model=EnrichResponse)
async def enrich_person(payload: EnrichRequest):
    return await people_service.enrich_person(payload.person_id)
