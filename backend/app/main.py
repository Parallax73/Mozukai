from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import product, user
from app.db.database_connection import engine, Base
from app.core.config import settings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(product.router)
app.include_router(user.router)
