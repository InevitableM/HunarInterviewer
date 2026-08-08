from fastapi import APIRouter, Depends

from app.database.mongo import get_collection
from app.dependencies import get_current_user
from app.services import candidate_service, interview_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])


@router.get("/")
async def get_dashboard():
    interviews = await interview_service.list_interviews()
    transcripts = get_collection("transcripts")

    rows = []
    for interview in interviews:
        candidate = await candidate_service.get_candidate(interview["candidate_id"])
        transcript = await transcripts.find_one({"interview_id": interview["id"]})

        rows.append({
            "interview_id": interview["id"],
            "candidate_name": candidate["name"] if candidate else None,
            "candidate_phone": candidate["phone"] if candidate else None,
            "candidate_status": candidate["status"] if candidate else None,
            "interview_status": interview["status"],
            "started_at": interview["started_at"],
            "ended_at": interview["ended_at"],
            "structured_answers": transcript.get("structured_answers") if transcript else None,
            "summary": transcript.get("summary") if transcript else None,
            "recording_url": transcript.get("recording_url") if transcript else None,
        })

    return rows


@router.get("/{interview_id}")
async def get_dashboard_detail(interview_id: str):
    interview = await interview_service.get_interview(interview_id)
    if not interview:
        return None

    candidate = await candidate_service.get_candidate(interview["candidate_id"])
    transcript = await get_collection("transcripts").find_one({"interview_id": interview_id})

    return {
        "interview": interview,
        "candidate": candidate,
        "transcript": {
            "structured_answers": transcript.get("structured_answers") if transcript else None,
            "summary": transcript.get("summary") if transcript else None,
            "recording_url": transcript.get("recording_url") if transcript else None,
            "messages": transcript.get("messages") if transcript else None,
        },
    }
