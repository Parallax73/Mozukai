from typing import Optional
from pydantic import BaseModel
from enum import Enum

# Enumeration to define the status of the purchase
class StatusTypeEnum(str, Enum):
    PENDING = 'pending'           
    PAID = 'paid'                
    PROCESSING = 'processing'  
    SHIPPED = 'shipped'        
    DELIVERED = 'delivered'     
    CANCELED = 'canceled'         
    REFUNDED = 'refunded'        
    FAILED = 'failed'

# Pydantic model representing the schema for purchase data.
# Used for validation, serialization, and documentation in API requests/responses.
class Purchase(BaseModel):
    id: int
    # Unique identifier of the purchase

    product_id: int
    # Purchased product id

    email: str
    # User's email

    name : str
    # User's full name

    address: str
    # User's address

    complement: str | None
    # User's address complement, can be None

    city: str
    # User's address city


    state: str
    # User's address state

    cep: int
    # User cep it must be an 8 digit number 

    status: StatusTypeEnum
    # Purchase status, restricted to enum types.

class PurchaseCreate(BaseModel):
    product_id: int
    email: str
    name: str
    address: str
    complement: Optional[str] = None
    city: str
    state: str
    cep: int
    status: StatusTypeEnum = StatusTypeEnum.PAID 

class Config:
    orm_mode = True
    # Enables compatibility with ORM objects,
    # allowing automatic data loading from SQLAlchemy models.