import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Configure application-level logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Log the database URL being used for connection (should be masked or removed in production logs)
logger.info("Initializing database engine with URL: %s", settings.database_url)

# Create an asynchronous SQLAlchemy engine using the configured database URL.
# The `echo=True` flag logs all SQL statements for debugging purposes.
engine = create_async_engine(settings.database_url, echo=True)

# Create a factory for asynchronous session objects.
# `expire_on_commit=False` allows access to ORM objects after commit without reloading.
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Declare the base class from which all ORM models should inherit.
# This is required for SQLAlchemy to track model metadata.
Base = declarative_base()
