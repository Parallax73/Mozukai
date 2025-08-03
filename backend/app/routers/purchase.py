from typing import List, Literal, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request, Response, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.schemas.purchase import PurchaseCreate, Purchase, StatusTypeEnum  
from app.services.puchase_service import create_purchase, get_purchase_by_id, get_purchase_by_product_id, get_filtered_purchases
from app.models.purchase import PurchaseModel
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
router = APIRouter()

@router.post("/create-purchase", status_code=201)
async def create(purchase: PurchaseCreate, db: AsyncSession = Depends(get_db)):
    """
    Creates a new purchase object after user is redirected to success page.
    Args:
        purchase (PurchaseCreate): Data required to create a purchase.
        db (AsyncSession): Database session dependency.
    Returns:
        The created purchase object.
    """
    logger.info(f"Attempting to create purchase for user {purchase.email}")
    purchase = await create_purchase(db=db, purchase=purchase)
    return purchase

@router.get("/get-purchases", response_model=List[Purchase])
async def get(
    status: Optional[StatusTypeEnum] = Query(None),
    sort_date: Optional[Literal["asc", "desc"]] = Query("desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: AsyncSession = Depends(get_db)
) -> List[Purchase]:
    """
    Returns:
        A filtered list of purchases, or all if no filters are applied
    """
    logger.info("Fetching a list of purchases")
    purchases = await get_filtered_purchases(
        db=db,
        status=status,
        sort_date=sort_date,
        skip=skip,
        limit=limit
    )
    return [Purchase.model_validate(purchase) for purchase in purchases]

@router.get("/get-purchase/{purchase_id}", response_model=Purchase)
async def get_by_id(purchase_id: int, db: AsyncSession = Depends(get_db)) -> Purchase:
    """
    Args:
        purchase_id: Id from the purchase the user wants to retrieve
    Returns:
        The purchase with the id the user entered
    """
    logger.info(f"Trying to fetch a purchase by the id: {purchase_id}")
    purchase = await get_purchase_by_id(db=db, purchase_id=purchase_id)
    return Purchase.model_validate(purchase)

@router.get("/get-purchase-by-product/{product_id}", response_model=Purchase)
async def get_by_product_id(product_id: int, db: AsyncSession = Depends(get_db)) -> Purchase:
    """
    Args:
        product_id: Id from the product the user wants to retrieve purchase for
    Returns:
        The purchase for the product with the specified id
    """
    logger.info(f"Trying to fetch a purchase by product id: {product_id}")
    purchase = await get_purchase_by_product_id(product_id=product_id, db=db)
    return Purchase.model_validate(purchase)