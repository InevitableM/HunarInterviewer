from bson import ObjectId
from bson.errors import InvalidId


def to_object_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise ValueError(f"'{id_str}' is not a valid id")


def doc_id_to_str(doc: dict) -> dict:
    # mongo gives us _id as ObjectId, frontend wants a plain string "id"
    if not doc:
        return doc
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc
