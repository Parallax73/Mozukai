from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.models.product import ProductModel 
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password, get_subject_from_token

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    password = get_password_hash(user_in.password)
    db_user = User(email=user_in.email, password=password)
    db.add(db_user)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already in use."
        )
    await db.refresh(db_user)
    return db_user

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user

async def get_products_cart(db: AsyncSession, token: str) -> list[ProductModel] | None:
    try:
        user_email = get_subject_from_token(token)
        if not user_email:
            return None
    except Exception:
        return None
    
    user = await get_user_by_email(db, user_email)
    if not user:
        return None
    
    cart = getattr(user, 'product_cart', None)
    if cart is None or not cart:
        return []
    
    cart_ids = list(cart) if cart else []
    
    if not cart_ids:
        return []
   
    result = await db.execute(
        select(ProductModel).where(ProductModel.id.in_(cart_ids))
    )
    products = list(result.scalars().all())
    
    return products

async def remove_product_from_cart(db: AsyncSession, token: str, product_id: int) -> list[ProductModel]:
    try:
        user_email = get_subject_from_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await get_user_by_email(db, user_email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    cart = getattr(user, "product_cart", None)
    if cart is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")

    if product_id not in cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not in cart")

    cart.remove(product_id)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    result = await db.execute(select(ProductModel).where(ProductModel.id.in_(cart)))
    return list(result.scalars().all())