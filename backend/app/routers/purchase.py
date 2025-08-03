from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.schemas.purchase import PurchaseCreate
from app.services.puchase_service import create_purchase, get_purchase_by_id, get_purchase_by_product_id, get_purchases
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
    product = await create_purchase(db=db, purchase=purchase)
    return product



