from pydantic import BaseModel, EmailStr
from typing import List

# Schema for user registration input data.
# Validates email format and requires a password.
# Optionally accepts a list of product IDs associated with the user.
class UserCreate(BaseModel):
    email: EmailStr
    # User's email address, validated as a proper email format.

    password: str
    # Plain-text password provided by the user during registration.

    product_ids: List[int] = []
    # Optional list of product IDs linked to the user, defaults to empty list.


# Schema for reading user data (output schema).
# Includes user ID, email, and list of product IDs in the user's cart.
class UserRead(BaseModel):
    id: int
    # Unique identifier of the user.

    email: EmailStr
    # User's email address.

    product_cart: List[int]
    # List of product IDs currently in the user's cart.

    class Config:
        orm_mode = True
        # Enables ORM compatibility for automatic parsing from database models.
