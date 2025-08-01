from sqlalchemy import Column, Integer, String, Text, Enum as SQLAlchemyEnum
from enum import Enum
from app.db.database_connection import Base


# Enumeration to define the status of the purchase.
# This ensures that the 'status' field can only take on predefined values,
# improving data integrity and consistency.
class StatusTypeEnum(str, Enum):
    PENDING = 'pending'           # Initial state, awaiting payment or processing.
    PAID = 'paid'                # Payment has been successfully received.
    PROCESSING = 'processing'  # Order is being prepared for shipment.
    SHIPPED = 'shipped'        # Product has been dispatched.
    DELIVERED = 'delivered'     # Product has reached the customer.
    CANCELED = 'canceled'         # Order has been cancelled.
    REFUNDED = 'refunded'        # Payment has been refunded to the customer.
    FAILED = 'failed'             # Purchase transaction failed.

# SQLAlchemy model representing the 'purchases' table in the database.
# This class defines the structure and data types for each column in the table.
class PurchaseModel(Base):
    __tablename__ = "purchases"  # Defines the name of the database table.

    id = Column(Integer, primary_key=True, index=True)
    # Unique identifier for each purchase, serving as the primary key.
    # 'index=True' creates a database index for faster lookups.

    product_id = Column(Integer, nullable=False)
    # Foreign key referencing the product that was purchased. Cannot be null.

    name = Column(String, nullable=False)
    # Name of the customer who made the purchase. Cannot be null.

    address = Column(Text, nullable=False)
    # Full shipping address for the purchase. Cannot be null.

    complement = Column(String, nullable=True)
    # Additional address information (e.g., apartment number). Can be null.

    city = Column(String, nullable=False)
    # City of the shipping address. Cannot be null.

    state = Column(String, nullable=False)
    # State of the shipping address. Cannot be null.

    cep = Column(Integer, nullable=False)
    # Note: 'max' and 'min' constraints (max=8, min=8) are typically applied
    # at the application level (e.g., Pydantic validation) or via database
    # check constraints, not directly in Column definition this way in SQLAlchemy.

    status = Column(SQLAlchemyEnum(StatusTypeEnum, name="status_enum"), nullable=False, default="Paid")
    # Current status of the purchase, constrained by the StatusTypeEnum.
    # 'nullable=False' means a status must always be present.
    # 'default="Paid"' sets a default value for new purchases if not specified.