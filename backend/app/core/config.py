import os
from dotenv import load_dotenv

# Load environment variables from a .env file
# This must be called before accessing any environment variables that are defined in .env
load_dotenv()

def get_env_variable(name: str) -> str:
    """
    Retrieves the value of an environment variable.

    Raises an EnvironmentError if the variable is not set, ensuring that
    critical configuration is always present at runtime.

    Args:
        name (str): The name of the environment variable to retrieve.

    Returns:
        str: The value of the environment variable.

    Raises:
        EnvironmentError: If the specified environment variable is not found.
    """
    value = os.environ.get(name)
    if value is None:
        raise EnvironmentError(f"Missing required environment variable: {name}")
    return value

class Settings:
    """
    Application settings loaded from environment variables.

    This class encapsulates all configuration parameters required by the application.
    It ensures that all necessary environment variables are loaded at startup
    and provides a centralized access point for settings.
    """
    database_url: str = get_env_variable("DATABASE_URL")
    allowed_origins: list[str] = get_env_variable("ALLOWED_ORIGINS").split(",")
    secret_key: str = get_env_variable("SECRET_KEY")
    algorithm: str = get_env_variable("ALGORITHM")
    access_token_lifetime: int = int(get_env_variable("ACCESS_TOKEN_LIFETIME"))
    long_refresh_token_lifetime: int = int(get_env_variable("LONG_REFRESH1_TOKEN_LIFETIME"))
    short_refresh_token_lifetime: int = int(get_env_variable("SHORT_REFRESH_TOKEN_LIFETIME"))
    stripe_key: str = get_env_variable("STRIPE_KEY")
    smtp_username: str = get_env_variable("SMTP_USERNAME")
    smtp_password: str = get_env_variable("SMTP_PASSWORD") # Typo corrected: paswword -> password
    smtp_server: str = get_env_variable("SMTP_SERVER")
    smtp_port: int = int(get_env_variable("SMTP_PORT"))

# Create a single instance of the Settings class to be imported throughout the application.
settings = Settings()