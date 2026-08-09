from typing import Optional

from pydantic import BaseModel, EmailStr


class CandidateCreate(BaseModel):
    name: str
    phone: str
    role: str  # role being hired for, e.g. "Software Engineer"
    email: Optional[EmailStr] = None
    linkedin: Optional[str] = None
    resume: Optional[str] = None  # just storing a url/path for now
    source: str = "direct"  # "direct" or "people_search"


class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    linkedin: Optional[str] = None
    resume: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


class CandidateOut(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    linkedin: Optional[str] = None
    resume: Optional[str] = None
    role: Optional[str] = None
    source: str
    status: str
