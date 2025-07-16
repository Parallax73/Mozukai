from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text, Float, Enum as SQLAlchemyEnum
import enum

from database_connection import Base, AsyncSessionLocal, engine

class ProductTypeEnum(str, enum.Enum):
    bonsai = "bonsai"
    pot = "pot"
    accessory = "accessory"
    tools = "tools"
    supply = "supply"

class ProductModel(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    sourceImage = Column(String, nullable=False)
    sourceModel = Column(String, nullable=False)
    type = Column(SQLAlchemyEnum(ProductTypeEnum, name="types_enum"), nullable=False)

class Product(BaseModel):
    id: int
    name: str
    price: float
    description: str
    sourceImage: str
    sourceModel: str
    type: ProductTypeEnum

    class Config:
        orm_mode = True

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/products", response_model=List[Product])
async def get_all_products(db: AsyncSession = Depends(get_db), type: Optional[ProductTypeEnum] = Query(None)):
    query = select(ProductModel)
    if type:
        query = query.where(ProductModel.type == type)
    result = await db.execute(query)
    products = result.scalars().all()
    return products
