from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database_connection import AsyncSessionLocal

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Async generator function to provide a database session.

    Yields:
        AsyncSession: An asynchronous database session for dependency injection.

    Usage:
        This function is intended to be used as a FastAPI dependency,
        ensuring that each request has its own session which is properly
        closed after use.
    """
    async with AsyncSessionLocal() as session:
        yield session
