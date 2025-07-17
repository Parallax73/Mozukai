from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from fastapi import HTTPException
from app.models.product import ProductModel
from app.schemas.product import ProductTypeEnum

async def get_all_products_service(
    db: AsyncSession,
    type: Optional[ProductTypeEnum] = None,
    name: Optional[str] = None
) -> List[ProductModel]:
    query = select(ProductModel)
    if type:
        query = query.where(ProductModel.type == type)
    if name:
        query = query.where(ProductModel.name.ilike(f"%{name}%"))
    result = await db.execute(query)
    return list(result.scalars().all())

async def get_product_by_id_service(product_id: int, db: AsyncSession) -> ProductModel:
    result = await db.execute(select(ProductModel).where(ProductModel.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    return product
