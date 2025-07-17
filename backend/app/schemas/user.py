from pydantic import BaseModel, EmailStr
from typing import List

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    product_ids: List[int] = []

class UserRead(BaseModel):
    id: int
    email: EmailStr
    product_cart: List[int]

    class Config:
        orm_mode = True
