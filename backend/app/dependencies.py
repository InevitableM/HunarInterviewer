from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.utils.security import decode_access_token

bearer_scheme = HTTPBearer()


async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    user_id = decode_access_token(creds.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="invalid or expired token")
    return user_id
