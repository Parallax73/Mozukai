from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base


DATABASE_URL = "postgresql+asyncpg://admin:secret@localhost:5432/mydb"


engine = create_async_engine(DATABASE_URL, echo=True)


AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession, 
    expire_on_commit=False, 
)

Base = declarative_base()
