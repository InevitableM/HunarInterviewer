from typing import Optional

from pydantic import BaseModel


class TranscriptOut(BaseModel):
    interview_id: str
    messages: Optional[list] = None
    summary: Optional[str] = None
    structured_answers: Optional[dict] = None
    recording_url: Optional[str] = None
