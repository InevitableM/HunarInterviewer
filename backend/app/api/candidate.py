from fastapi import APIRouter, HTTPException

from app.schemas.candidate import CandidateCreate, CandidateOut, CandidateUpdate
from app.services import candidate_service

router = APIRouter(prefix="/candidate", tags=["candidate"])


@router.post("/", response_model=CandidateOut)
async def create_candidate(payload: CandidateCreate):
    doc = await candidate_service.create_candidate(payload.model_dump())
    return doc


@router.get("/", response_model=list[CandidateOut])
async def list_candidates():
    return await candidate_service.list_candidates()


@router.get("/{candidate_id}", response_model=CandidateOut)
async def get_candidate(candidate_id: str):
    doc = await candidate_service.get_candidate(candidate_id)
    if not doc:
        raise HTTPException(status_code=404, detail="candidate not found")
    return doc


@router.put("/{candidate_id}", response_model=CandidateOut)
async def update_candidate(candidate_id: str, payload: CandidateUpdate):
    doc = await candidate_service.update_candidate(candidate_id, payload.model_dump())
    if not doc:
        raise HTTPException(status_code=404, detail="candidate not found")
    return doc
