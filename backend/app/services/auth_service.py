from fastapi import HTTPException

from app.database.mongo import get_collection
from app.utils.object_id import doc_id_to_str
from app.utils.security import create_access_token, hash_password, verify_password

COLLECTION = "users"


async def register_user(name: str, email: str, password: str) -> dict:
    collection = get_collection(COLLECTION)

    existing = await collection.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="email already registered")

    user = {"name": name, "email": email, "password": hash_password(password)}
    result = await collection.insert_one(user)

    return {"id": str(result.inserted_id), "name": name, "email": email}


async def login_user(email: str, password: str) -> str:
    collection = get_collection(COLLECTION)
    user = await collection.find_one({"email": email})

    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="invalid email or password")

    return create_access_token(str(user["_id"]))
