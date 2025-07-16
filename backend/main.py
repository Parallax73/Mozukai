from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Text, Double
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List

DATABASE_URL = "postgresql+asyncpg://admin:secret@localhost:5432/mydb"

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

app = FastAPI()


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def catch_exceptions_middleware(request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

# Modelos
class ProductModel(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    price = Column(Double) 
    description = Column(Text)
    sourceImage = Column(String)
    sourceModel = Column(String)

class Product(BaseModel):
    id: int
    name: str
    price: float  
    description: str
    sourceImage: str
    sourceModel: str

    class Config:
        orm_mode = True


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/products", response_model=List[Product])
async def get_all_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProductModel))
    products = result.scalars().all()
    return products

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ProductModel).where(ProductModel.id == product_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
