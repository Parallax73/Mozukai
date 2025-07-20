import jwt
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from app.core.config import settings
from datetime import datetime, timedelta, timezone

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_token(data: dict, minutes: int) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def create_access_token(data: dict) -> str:
    return create_token(data, settings.access_token_lifetime)


def create_refresh_token(data: dict, remember_me: bool = False) -> str:
    if remember_me:
        minutes = settings.long_refresh_token_lifetime
    else:
        minutes = settings.short_refresh_token_lifetime
    return create_token(data, minutes)
