from typing import Optional

from pydantic import BaseModel


class InterviewStartRequest(BaseModel):
    candidate_id: str


class BulkInterviewStartRequest(BaseModel):
    candidate_ids: list[str]


class InterviewOut(BaseModel):
    id: str
    candidate_id: str
    hunar_call_id: Optional[str] = None
    status: str
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
