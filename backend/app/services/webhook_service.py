from fastapi import HTTPException

from app.database.mongo import get_collection
from app.services import candidate_service, hunar_service, interview_service

EVENTS_COLLECTION = "webhook_events"
TRANSCRIPTS_COLLECTION = "transcripts"


async def handle_webhook(raw_body: bytes, signature_header: str, timestamp_header: str, payload: dict) -> None:
    if not hunar_service.verify_signature(raw_body, signature_header, timestamp_header):
        raise HTTPException(status_code=401, detail="invalid webhook signature")

    call_id = payload.get("call_id")
    event_type = payload.get("event_type")

    # log every event we get, regardless of type, for debugging/audit
    events = get_collection(EVENTS_COLLECTION)
    await events.insert_one({"call_id": call_id, "event_type": event_type, "payload": payload})

    interview = await interview_service.get_by_call_id(call_id)
    if not interview:
        return  # nothing to update, but we already logged it above

    if event_type == "call_status_updated":
        await _handle_status_updated(interview, payload)
    elif event_type == "call_summary":
        await _handle_summary(interview, payload)
    elif event_type == "call_result_done":
        result = payload.get("result") or {}
        await _save_transcript(interview["id"], structured_answers=result, summary=result.get("summary"))
    elif event_type == "call_recording_done":
        await _save_transcript(interview["id"], recording_url=payload.get("recording_url"))


async def _handle_status_updated(interview: dict, payload: dict) -> None:
    status = payload.get("status")
    await interview_service.update_status(
        interview["hunar_call_id"],
        status,
        started_at=payload.get("started_at"),
        ended_at=payload.get("ended_at"),
    )

    if status == "IN_PROGRESS":
        await candidate_service.update_candidate_status(interview["candidate_id"], "INTERVIEWING")


async def _handle_summary(interview: dict, payload: dict) -> None:
    await interview_service.update_status(
        interview["hunar_call_id"],
        payload.get("status", "COMPLETED"),
        started_at=payload.get("started_at"),
        ended_at=payload.get("ended_at"),
    )
    result = payload.get("result") or {}
    await _save_transcript(
        interview["id"],
        structured_answers=result,
        summary=result.get("summary"),
        recording_url=payload.get("recording_url"),
    )
    await candidate_service.update_candidate_status(interview["candidate_id"], "COMPLETED")


async def _save_transcript(
    interview_id: str, structured_answers: dict = None, summary: str = None, recording_url: str = None
) -> None:
    update = {}
    if structured_answers is not None:
        update["structured_answers"] = structured_answers
    if summary is not None:
        update["summary"] = summary
    if recording_url is not None:
        update["recording_url"] = recording_url
    if not update:
        return

    collection = get_collection(TRANSCRIPTS_COLLECTION)
    await collection.update_one({"interview_id": interview_id}, {"$set": update}, upsert=True)
