from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mongo_uri: str
    mongo_db_name: str

    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    hunar_api_key: str
    hunar_api_base_url: str = "https://api.voice.hunar.ai"
    hunar_agent_id: str

    apollo_api_key: str


@lru_cache
def get_settings() -> Settings:
    return Settings()
