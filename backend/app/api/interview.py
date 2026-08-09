from fastapi import APIRouter, HTTPException

# from app.dependencies import get_current_user
from app.schemas.interview import BulkInterviewStartRequest, InterviewOut, InterviewStartRequest
from app.services import interview_service

router = APIRouter(prefix="/interview", tags=["interview"])  # dependencies=[Depends(get_current_user)]


@router.post("/start", response_model=InterviewOut)
async def start_interview(payload: InterviewStartRequest):
    return await interview_service.start_interview(payload.candidate_id)


@router.post("/bulk-start", response_model=list[InterviewOut])
async def bulk_start_interview(payload: BulkInterviewStartRequest):
    return await interview_service.start_bulk_interviews(payload.candidate_ids)


@router.get("/", response_model=list[InterviewOut])
async def list_interviews(candidate_id: str | None = None):
    return await interview_service.list_interviews(candidate_id)


@router.get("/{interview_id}", response_model=InterviewOut)
async def get_interview(interview_id: str):
    doc = await interview_service.get_interview(interview_id)
    if not doc:
        raise HTTPException(status_code=404, detail="interview not found")
    return doc
