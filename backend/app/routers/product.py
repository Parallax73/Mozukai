from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.schemas.product import Product, ProductTypeEnum
from app.db.database_connection import AsyncSessionLocal
from app.services.product_service import get_all_products_service, get_product_by_id_service

router = APIRouter(prefix="/products", tags=["Products"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/", response_model=List[Product])
async def get_all_products(
    db: AsyncSession = Depends(get_db),
    type: Optional[ProductTypeEnum] = Query(None),
    name: Optional[str] = Query(None)
):
    return await get_all_products_service(db=db, type=type, name=name)

@router.get("/{product_id}", response_model=Product)
async def get_product_by_id(product_id: int, db: AsyncSession = Depends(get_db)):
    return await get_product_by_id_service(product_id=product_id, db=db)
