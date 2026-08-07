from fastapi import APIRouter

from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(payload: RegisterRequest):
    return await auth_service.register_user(payload.name, payload.email, payload.password)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    token = await auth_service.login_user(payload.email, payload.password)
    return TokenResponse(access_token=token)
