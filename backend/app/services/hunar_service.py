import base64
import hashlib
import hmac
import time

import httpx

from app.config.settings import get_settings

BASE_PATH = "/external/v1"


def _headers():
    settings = get_settings()
    return {"X-API-Key": settings.hunar_api_key}


async def start_call(candidate_name: str, phone: str, custom_data: dict | None = None) -> dict:
    settings = get_settings()
    url = f"{settings.hunar_api_base_url}{BASE_PATH}/calls/"

    body = {
        "agent_id": settings.hunar_agent_id,
        "callee_name": candidate_name,
        "mobile_number": phone,
    }
    if custom_data:
        body["custom_data"] = custom_data

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=body, headers=_headers())
        resp.raise_for_status()
        return resp.json()


async def fetch_call(call_id: str) -> dict:
    settings = get_settings()
    url = f"{settings.hunar_api_base_url}{BASE_PATH}/calls/{call_id}/"

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=_headers())
        resp.raise_for_status()
        return resp.json()


def verify_signature(raw_body: bytes, signature_header: str, timestamp_header: str) -> bool:
    settings = get_settings()

    # reject stale/replayed webhooks
    try:
        ts = int(timestamp_header)
    except (TypeError, ValueError):
        return False
    if abs(time.time() - ts) > 300:
        return False

    message = f"{timestamp_header.strip()}.".encode() + raw_body
    expected = hmac.new(settings.hunar_api_key.encode(), message, hashlib.sha256).digest()
    expected_b64 = base64.b64encode(expected).decode()

    given_signatures = signature_header.split(",")
    for sig in given_signatures:
        if hmac.compare_digest(sig.strip(), expected_b64):
            return True
    return False
