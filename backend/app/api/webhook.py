import json

from fastapi import APIRouter, Request

from app.services import webhook_service

router = APIRouter(prefix="/webhook/hunar", tags=["webhook"])


async def _process(request: Request):
    raw_body = await request.body()
    signature = request.headers.get("X-Hunar-Signature", "")
    timestamp = request.headers.get("X-Hunar-Timestamp", "")

    payload = json.loads(raw_body)
    await webhook_service.handle_webhook(raw_body, signature, timestamp, payload)

    return {"received": True}


@router.post("/status")
async def call_status_updated(request: Request):
    return await _process(request)


@router.post("/recording")
async def call_recording_done(request: Request):
    return await _process(request)


@router.post("/result")
async def call_result_done(request: Request):
    return await _process(request)


@router.post("/summary")
async def call_summary(request: Request):
    return await _process(request)
