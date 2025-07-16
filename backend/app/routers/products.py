from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.schemas.product import Product, ProductTypeEnum
from app.models.product import ProductModel
from app.db.database_connection import AsyncSessionLocal

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
    query = select(ProductModel)
    if type:
        query = query.where(ProductModel.type == type)
    if name:
        query = query.where(ProductModel.name.ilike(f"%{name}%"))
    result = await db.execute(query)
    products = result.scalars().all()
    return products

@router.get("/{product_id}", response_model=Product)
async def get_product_by_id(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProductModel).where(ProductModel.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    return product
