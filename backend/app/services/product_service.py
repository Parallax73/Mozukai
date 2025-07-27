import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from fastapi import HTTPException
from app.models.product import ProductModel
from app.schemas.product import ProductTypeEnum

# Configure logger for this module
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

async def get_all_products_service(
    db: AsyncSession,
    type: Optional[ProductTypeEnum] = None,
    name: Optional[str] = None
) -> List[ProductModel]:
    """
    Retrieves a list of products filtered optionally by type and/or name.

    Args:
        db (AsyncSession): Asynchronous database session.
        type (Optional[ProductTypeEnum]): Filter products by this type if provided.
        name (Optional[str]): Filter products by name substring if provided.

    Returns:
        List[ProductModel]: List of products matching the criteria.
    """
    logger.info("Fetching products with filters - type: %s, name: %s", type, name)

    query = select(ProductModel)

    if type:
        query = query.where(ProductModel.type == type)
        logger.debug("Filtering products by type: %s", type)

    if name:
        query = query.where(ProductModel.name.ilike(f"%{name}%"))
        logger.debug("Filtering products by name containing: %s", name)

    result = await db.execute(query)
    products = list(result.scalars().all())

    logger.info("Retrieved %d products from database", len(products))
    return products


async def get_product_by_id_service(product_id: int, db: AsyncSession) -> ProductModel:
    """
    Retrieves a single product by its unique identifier.

    Args:
        product_id (int): The ID of the product to retrieve.
        db (AsyncSession): Asynchronous database session.

    Returns:
        ProductModel: The product object if found.

    Raises:
        HTTPException: If no product with the given ID is found (404 error).
    """
    logger.info("Fetching product with ID: %d", product_id)

    result = await db.execute(select(ProductModel).where(ProductModel.id == product_id))
    product = result.scalar_one_or_none()

    if not product:
        logger.warning("Product with ID %d not found", product_id)
        raise HTTPException(status_code=404, detail="Product not found.")

    logger.info("Product with ID %d found: %s", product_id, product.name)
    return product
