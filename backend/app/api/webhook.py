import json

from fastapi import APIRouter, Request

from app.services import webhook_service

router = APIRouter(prefix="/webhook", tags=["webhook"])


@router.post("/hunar")
async def hunar_webhook(request: Request):
    raw_body = await request.body()
    signature = request.headers.get("X-Hunar-Signature", "")
    timestamp = request.headers.get("X-Hunar-Timestamp", "")

    payload = json.loads(raw_body)
    await webhook_service.handle_webhook(raw_body, signature, timestamp, payload)

    return {"received": True}
