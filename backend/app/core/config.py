from pydantic import BaseSettings
from typing import List

class Settings(BaseSettings): # type: ignore
    database_url: str
    allowed_origins: List[str]
    secret_key: str

    class Config:
        env_file = ".env"

settings = Settings()
