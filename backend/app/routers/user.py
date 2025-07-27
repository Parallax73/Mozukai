import logging
import jwt
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.schemas.user import UserCreate, UserRead
from app.services.user_service import (
    create_user,
    get_user_by_email,
    authenticate_user,
    remove_product_from_cart,
    get_products_cart,
)
from app.dependencies import get_db
from app.core.security import create_access_token, create_refresh_token
from app.core.config import settings
from jwt import PyJWTError

# Configure module logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


@router.post("/register", response_model=UserRead)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Registers a new user if the email is not already taken.

    Args:
        user_in (UserCreate): User registration data.
        db (AsyncSession): Database session dependency.

    Returns:
        UserRead: Created user data.
    """
    logger.info("Attempting to register user with email: %s", user_in.email)
    existing_user = await get_user_by_email(db, user_in.email)
    if existing_user:
        logger.warning("Registration failed: Email %s already registered", user_in.email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = await create_user(db, user_in)
    logger.info("User registered successfully: %s", user.email)
    return user


@router.post("/login")
async def login_user(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticates user and returns access and refresh tokens.

    Supports 'remember me' functionality via query parameter.

    Args:
        request (Request): FastAPI request object.
        response (Response): FastAPI response object to set cookies.
        form_data (OAuth2PasswordRequestForm): Login credentials.
        db (AsyncSession): Database session.

    Returns:
        dict: Contains JWT access token and token type.
    """
    logger.info("Login attempt for user: %s", form_data.username)
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        logger.warning("Login failed for user: %s", form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    remember_me = request.query_params.get("rememberMe", "false").lower() == "true"
    logger.info("Remember me flag for user %s: %s", user.email, remember_me)

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email}, remember_me=remember_me)

    # Set HttpOnly refresh token cookie with appropriate expiration based on remember_me flag
    max_age = 60 * (
        settings.long_refresh_token_lifetime if remember_me else settings.short_refresh_token_lifetime
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=max_age,
        samesite="lax",
        secure=True,
        path="/",
    )
    logger.info("Login successful for user: %s", user.email)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh")
async def refresh_token(refresh_token: str = Cookie(None)):
    """
    Issues a new access token using a valid refresh token cookie.

    Args:
        refresh_token (str): JWT refresh token from cookie.

    Returns:
        dict: New access token and token type.

    Raises:
        HTTPException: For missing or invalid refresh tokens.
    """
    if not refresh_token:
        logger.warning("Refresh token missing in request")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

    try:
        payload = jwt.decode(
            refresh_token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        email = payload.get("sub")
        if not email:
            logger.error("Refresh token missing 'sub' claim")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    except PyJWTError as e:
        logger.error("Invalid refresh token: %s", str(e))
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    new_access_token = create_access_token(data={"sub": email})
    logger.info("Refresh token valid, issued new access token for user: %s", email)
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout_user(response: Response):
    """
    Logs out the user by deleting the refresh token cookie.

    Args:
        response (Response): FastAPI response to delete cookie.

    Returns:
        dict: Empty response.
    """
    logger.info("Logging out user by deleting refresh token cookie")
    response.delete_cookie(
        key="refresh_token",
        path="/",
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return {}


@router.options("/logout")
async def options_logout():
    """
    Handles CORS preflight requests for the logout endpoint.

    Returns:
        Response: HTTP 204 No Content.
    """
    logger.debug("Received OPTIONS request for /logout endpoint")
    return Response(status_code=204)


@router.get("/cart/products")
async def get_cart_products(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """
    Retrieves the current user's cart products.

    Args:
        db (AsyncSession): Database session.
        token (str): JWT access token from OAuth2 scheme.

    Returns:
        list: Products in the user's cart.

    Raises:
        HTTPException: If user not found.
    """
    logger.info("Fetching cart products for user with token")
    products = await get_products_cart(db, token)
    if products is None:
        logger.warning("User not found for token during cart retrieval")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    logger.info("Returned %d products from user cart", len(products))
    return products


@router.delete("/cart/remove/{product_id}")
async def remove_from_cart(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """
    Removes a product from the current user's cart.

    Args:
        product_id (int): ID of the product to remove.
        db (AsyncSession): Database session.
        token (str): JWT access token from OAuth2 scheme.

    Returns:
        Updated cart after product removal.

    Raises:
        HTTPException: On failure to remove product.
    """
    logger.info("Attempting to remove product ID %d from user cart", product_id)
    try:
        updated_cart = await remove_product_from_cart(db, token, product_id)
        logger.info("Product ID %d removed from cart successfully", product_id)
    except HTTPException as e:
        logger.error("Failed to remove product ID %d from cart: %s", product_id, str(e.detail))
        raise e
    return updated_cart
