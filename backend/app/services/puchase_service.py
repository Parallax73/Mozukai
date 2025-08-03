import logging
from typing import List, Optional, Literal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, asc
from fastapi import HTTPException, status as st
from app.models.purchase import PurchaseModel
from app.schemas.purchase import PurchaseCreate
from app.schemas.purchase import StatusTypeEnum

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


async def create_purchase(db: AsyncSession, purchase: PurchaseCreate) -> PurchaseModel:
    try:
        db_purchase = PurchaseModel(
            product_id=purchase.product_id,
            email=purchase.email,
            name=purchase.name,
            address=purchase.address,
            complement=purchase.complement,
            city=purchase.city,
            state=purchase.state,
            cep=purchase.cep,
            status=purchase.status,
            date=purchase.date
        )
        db.add(db_purchase)
        await db.commit()
        await db.refresh(db_purchase)
        logger.info(f"Created new purchase with ID {db_purchase.id}")
        return db_purchase
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating purchase: {str(e)}")
        raise HTTPException(
            status_code=st.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create purchase"
        )


async def get_purchases(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[PurchaseModel]:
    try:
        result = await db.execute(select(PurchaseModel).offset(skip).limit(limit))
        purchases = result.scalars().all()
        logger.info(f"Retrieved {len(purchases)} purchases")
        return list(purchases)
    except Exception as e:
        logger.error(f"Error retrieving purchases: {str(e)}")
        raise HTTPException(
            status_code=st.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve purchases"
        )


async def get_filtered_purchases(
    db: AsyncSession,
    status: Optional[StatusTypeEnum] = None,
    sort_date: Optional[Literal["asc", "desc"]] = "desc",
    skip: int = 0,
    limit: int = 100
) -> List[PurchaseModel]:
    try:
        query = select(PurchaseModel)

        if status:
            query = query.where(PurchaseModel.status == status)

        if sort_date == "asc":
            query = query.order_by(asc(PurchaseModel.date))
        else:
            query = query.order_by(desc(PurchaseModel.date))

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        purchases = result.scalars().all()
        logger.info(f"Retrieved {len(purchases)} filtered purchases")
        return list(purchases)
    except Exception as e:
        logger.error(f"Error retrieving filtered purchases: {str(e)}")
        raise HTTPException(
            status_code=st.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve filtered purchases"
        )


async def get_purchase_by_id(db: AsyncSession, purchase_id: int) -> PurchaseModel:
    try:
        result = await db.execute(select(PurchaseModel).where(PurchaseModel.id == purchase_id))
        purchase = result.scalar_one_or_none()
        if not purchase:
            logger.warning(f"Purchase with ID {purchase_id} not found")
            raise HTTPException(
                status_code=st.HTTP_404_NOT_FOUND,
                detail="Purchase not found"
            )
        logger.info(f"Retrieved purchase with ID {purchase_id}")
        return purchase
    except Exception as e:
        logger.error(f"Error retrieving purchase by ID: {str(e)}")
        raise HTTPException(
            status_code=st.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve purchase by ID"
        )

async def get_purchase_by_product_id(db: AsyncSession, product_id: int) -> PurchaseModel:
    try:
        result = await db.execute(select(PurchaseModel).where(PurchaseModel.product_id == product_id))
        purchase = result.scalar_one_or_none()
        logger.info(f"Retrieved purchase for product ID {product_id}: {purchase}")
        
        if purchase is None:
            raise HTTPException(
                status_code=st.HTTP_404_NOT_FOUND,
                detail=f"No purchase found for product {product_id}"
            )
            
        return purchase
    except Exception as e:
        logger.error(f"Error retrieving purchase for product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=st.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve purchase for product {product_id}"
        )
