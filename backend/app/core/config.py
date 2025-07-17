import os
from dotenv import load_dotenv

load_dotenv()

def get_env_variable(name: str) -> str:
    value = os.environ.get(name)
    if value is None:
        raise EnvironmentError(f"Missing required environment variable: {name}")
    return value

class Settings:
    database_url: str = get_env_variable("DATABASE_URL")
    allowed_origins: list[str] = get_env_variable("ALLOWED_ORIGINS").split(",")
    secret_key: str = get_env_variable("SECRET_KEY")
    algorithm: str = get_env_variable("ALGORITHM")

settings = Settings()
