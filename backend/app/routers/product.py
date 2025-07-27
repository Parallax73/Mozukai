import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.schemas.product import Product, ProductTypeEnum
from app.db.database_connection import AsyncSessionLocal
from app.services.product_service import get_all_products_service, get_product_by_id_service

# Configure module-level logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Define router with a prefix and tag for organizational clarity
router = APIRouter(prefix="/products", tags=["Products"])

async def get_db():
    """
    Dependency that provides a database session for each request.
    Ensures proper cleanup of async session after use.
    """
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/", response_model=List[Product])
async def get_all_products(
    db: AsyncSession = Depends(get_db),
    type: Optional[ProductTypeEnum] = Query(None),
    name: Optional[str] = Query(None)
):
    """
    Retrieve a list of products, optionally filtered by type or name.

    Query Parameters:
        type (Optional[ProductTypeEnum]): Filter by product category.
        name (Optional[str]): Filter by product name (partial match).

    Returns:
        List[Product]: A list of matching products.
    """
    logger.info("Fetching products with filters - type: %s, name: %s", type, name)
    products = await get_all_products_service(db=db, type=type, name=name)
    logger.info("Returned %d products", len(products))
    return products

@router.get("/{product_id}", response_model=Product)
async def get_product_by_id(product_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a single product by its unique identifier.

    Path Parameters:
        product_id (int): ID of the product to retrieve.

    Returns:
        Product: The product matching the given ID.
    """
    logger.info("Fetching product with ID: %d", product_id)
    product = await get_product_by_id_service(product_id=product_id, db=db)
    if product:
        logger.info("Product found: %s", product.name)
    else:
        logger.warning("Product with ID %d not found", product_id)
    return product
