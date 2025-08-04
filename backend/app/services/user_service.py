from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.models.product import ProductModel 
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password, get_subject_from_token
from app.services.smtp_service import send_welcome_email
from sqlalchemy import func
import logging

logger = logging.getLogger(__name__)

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    """
    Creates a new user in the database with a hashed password and sends a welcome email.

    Args:
        db (AsyncSession): Async database session.
        user_in (UserCreate): User registration data including email and password.

    Returns:
        User: Created User ORM model instance.

    Raises:
        HTTPException: If the email is already registered.
    """
    logger.info("Creating user with email: %s", user_in.email)

    password = get_password_hash(user_in.password)
    db_user = User(email=user_in.email, password=password)
    db.add(db_user)

    try:
        await db.commit()
        logger.info("User created successfully: %s", user_in.email)
    except IntegrityError:
        await db.rollback()
        logger.warning("Failed to create user - email already in use: %s", user_in.email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already in use."
        )

    await db.refresh(db_user)

    # Attempt to send welcome email asynchronously (fire and forget)
    await send_welcome_email(user_email=user_in.email)
    logger.info("Welcome email sent to: %s", user_in.email)

    return db_user


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    """
    Retrieves a user by their email address.

    Args:
        db (AsyncSession): Async database session.
        email (str): User email to query.

    Returns:
        User | None: User ORM instance or None if not found.
    """
    logger.debug("Fetching user by email: %s", email)
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    """
    Authenticates a user by verifying email and password.

    Args:
        db (AsyncSession): Async database session.
        email (str): User email.
        password (str): Plain text password to verify.

    Returns:
        User | None: User if authentication succeeds, else None.
    """
    logger.info("Authenticating user: %s", email)
    user = await get_user_by_email(db, email)
    if not user:
        logger.warning("Authentication failed - user not found: %s", email)
        return None
    # Explicitly cast user.password to str to satisfy the type checker
    if not verify_password(password, str(user.password)):
        logger.warning("Authentication failed - invalid password: %s", email)
        return None
    logger.info("User authenticated successfully: %s", email)
    return user



async def get_products_cart(db: AsyncSession, token: str) -> list[ProductModel] | None:
    """
    Retrieves all products in the authenticated user's cart.

    Args:
        db (AsyncSession): Async database session.
        token (str): JWT token for user identification.

    Returns:
        list[ProductModel] | None: List of products in the cart or None if user/token invalid.
    """
    logger.info("Getting products from cart using token")
    try:
        user_email = get_subject_from_token(token)
        if not user_email:
            logger.warning("Token does not contain a valid subject")
            return None
    except Exception:
        logger.warning("Failed to decode token or invalid token")
        return None
    
    user = await get_user_by_email(db, user_email)
    if not user:
        logger.warning("User not found for email from token: %s", user_email)
        return None
    
    cart = getattr(user, 'product_cart', None)
    if cart is None or not cart:
        logger.info("User's cart is empty or not set: %s", user_email)
        return []
    
    cart_ids = list(cart) if cart else []
    
    if not cart_ids:
        logger.info("User's cart is empty after conversion: %s", user_email)
        return []
   
    result = await db.execute(
        select(ProductModel).where(ProductModel.id.in_(cart_ids))
    )
    products = list(result.scalars().all())
    
    logger.info("Retrieved %d products from user cart for user: %s", len(products), user_email)
    return products


async def remove_product_from_cart(db: AsyncSession, token: str, product_id: int) -> list[ProductModel]:
    """
    Removes a specified product from the authenticated user's cart.

    Args:
        db (AsyncSession): Async database session.
        token (str): JWT token identifying the user.
        product_id (int): Product ID to remove from the cart.

    Returns:
        list[ProductModel]: Updated list of products in the user's cart.

    Raises:
        HTTPException: For invalid tokens, missing user, or product not in cart.
    """
    logger.info("Removing product %d from user cart", product_id)

    try:
        user_email = get_subject_from_token(token)
    except Exception:
        logger.warning("Invalid token during remove product operation")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await get_user_by_email(db, user_email)
    if not user:
        logger.warning("User not found during remove product operation: %s", user_email)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    cart = getattr(user, "product_cart", None)
    if cart is None:
        logger.warning("Cart not found for user during remove product operation: %s", user_email)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")

    if product_id not in cart:
        logger.warning("Product %d not found in cart for user: %s", product_id, user_email)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not in cart")

    cart.remove(product_id)
    db.add(user)

    await db.commit()
    await db.refresh(user)

    logger.info("Product %d removed from cart for user: %s", product_id, user_email)

    result = await db.execute(select(ProductModel).where(ProductModel.id.in_(cart)))
    updated_products = list(result.scalars().all())

    logger.info("Returning updated product list with %d products", len(updated_products))
    return updated_products

async def get_user_count(db: AsyncSession) -> int:
    """
    Returns the total count of users in the database.

    Args:
        db (AsyncSession): Async database session.

    Returns:
        int: Total number of users.
    """
    logger.info("Getting total user count")
    result = await db.execute(select(func.count(User.id)))
    count = result.scalar() or 0 
    logger.info("Found %d total users in database", count)
    return count
