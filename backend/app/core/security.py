import logging
from typing import Any
import jwt
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from app.core.config import settings
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt

# Configure application-level logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Initialize password hashing context with bcrypt scheme.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Define the OAuth2 token retrieval scheme for secured endpoints.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_password_hash(password: str) -> str:
    """
    Hashes a plain-text password using the configured hashing algorithm.

    Args:
        password (str): The plain-text password to be hashed.

    Returns:
        str: A secure, hashed representation of the password.
    """
    logger.debug("Hashing password.")
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verifies whether a plain-text password matches its hashed version.

    Args:
        password (str): The input password provided by the user.
        hashed_password (str): The stored hashed password for comparison.

    Returns:
        bool: True if the password matches the hash, otherwise False.
    """
    logger.debug("Verifying password.")
    result = pwd_context.verify(password, hashed_password)
    logger.debug("Password verification result: %s", result)
    return result


def create_token(data: dict, minutes: int) -> str:
    """
    Generates a JSON Web Token (JWT) with an expiration time.

    Args:
        data (dict): Payload data to encode into the token.
        minutes (int): Token validity period in minutes.

    Returns:
        str: The encoded JWT as a string.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    logger.debug("Creating token with expiration: %s", expire.isoformat())
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    logger.info("Token created successfully.")
    return encoded_jwt


def create_access_token(data: dict) -> str:
    """
    Generates a short-lived access token for user sessions.

    Args:
        data (dict): Payload data to encode into the token.

    Returns:
        str: The encoded access token.
    """
    logger.info("Creating access token.")
    return create_token(data, settings.access_token_lifetime)


def create_refresh_token(data: dict, remember_me: bool = False) -> str:
    """
    Generates a refresh token with configurable duration.

    Args:
        data (dict): Payload data to encode into the token.
        remember_me (bool): Flag indicating whether to issue a long-lived token.

    Returns:
        str: The encoded refresh token.
    """
    minutes = (
        settings.long_refresh_token_lifetime
        if remember_me
        else settings.short_refresh_token_lifetime
    )
    logger.info("Creating refresh token. Remember me: %s", remember_me)
    return create_token(data, minutes)


def get_subject_from_token(token: str) -> str:
    """
    Extracts the 'sub' (subject) claim from a JWT, validating its structure.

    Args:
        token (str): The JWT string from which to extract the subject.

    Returns:
        str: The subject value (usually a user identifier).

    Raises:
        ValueError: If the token is invalid or the subject is missing/incorrect.
    """
    try:
        logger.debug("Decoding token to extract subject.")
        payload: dict[str, Any] = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        subject = payload.get("sub")
        if not isinstance(subject, str):
            logger.error("Subject claim is missing or not a string.")
            raise ValueError("Subject not found or not a string")
        logger.info("Token subject extracted successfully.")
        return subject
    except JWTError as e:
        logger.error("Failed to decode token: %s", str(e))
        raise ValueError("Invalid token")
