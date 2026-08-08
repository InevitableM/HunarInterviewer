from typing import Optional

from pydantic import BaseModel


class PeopleSearchRequest(BaseModel):
    job_title: Optional[str] = None
    limit: int = 10


class PersonOut(BaseModel):
    person_id: str
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    linkedin_url: Optional[str] = None


class EnrichRequest(BaseModel):
    person_id: str


class EnrichResponse(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class SearchHistoryOut(BaseModel):
    id: str
    job_title: Optional[str] = None
    results: list[PersonOut]
    created_at: str
