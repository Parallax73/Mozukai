from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime, timezone

class StatusTypeEnum(str, Enum):
    PENDING = 'pending' # Initial state, awaiting payment or processing.
    PAID = 'paid' # Payment has been successfully received.
    PROCESSING = 'processing' # Order is being prepared for shipment.
    SHIPPED = 'shipped' # Product has been dispatched.
    DELIVERED = 'delivered' # Product has reached the customer.
    CANCELED = 'canceled' # Order has been cancelled.
    REFUNDED = 'refunded' # Payment has been refunded to the customer.
    FAILED = 'failed' # Purchase transaction failed.

# Pydantic model representing the schema for purchase data.
# Used for validation, serialization, and documentation in API requests/responses.
class Purchase(BaseModel):
    id: int
    # Unique identifier of the purchase
    product_id: int
    # Purchased product id
    email: str
    # User's email
    name: str
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
    date: datetime
    # Date that product was purchased

    class Config:
        from_attributes = True # Enables compatibility with ORM objects

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
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
        # Enables compatibility with ORM objects,
        # allowing automatic data loading from SQLAlchemy models.