from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import product, user, payments, pipeline
from app.db.database_connection import engine, Base
from app.core.config import settings
import logging


# Initialize FastAPI application instance
app = FastAPI()

# Configure logging with DEBUG level and timestamped messages
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Add CORS middleware to allow cross-origin requests from configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,  # List of allowed origins from config
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

@app.on_event("startup")
async def startup_event():
    """
    Event handler that runs on application startup.

    Creates all database tables defined in the metadata if they do not exist.
    """
    logger.info("Starting up application - creating database tables if not exist")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables creation completed")

# Include product router endpoints under default prefix
app.include_router(product.router)
logger.info("Product router included")

# Include user router endpoints under default prefix
app.include_router(user.router)
logger.info("User router included")

# Include payments router endpoints under default prefix
app.include_router(payments.router)
logger.info("Payments router included")

app.include_router(pipeline.router)
