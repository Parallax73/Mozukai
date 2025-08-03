from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String, Text, Enum as SQLAlchemyEnum
from enum import Enum
from app.db.database_connection import Base
from app.schemas.purchase import StatusTypeEnum

# SQLAlchemy model representing the 'purchases' table in the database.
# This class defines the structure and data types for each column in the table.
class PurchaseModel(Base):
    __tablename__ = "purchases"  # Defines the name of the database table.

    id = Column(Integer, primary_key=True, index=True)
    # Unique identifier for each purchase, serving as the primary key.
    # 'index=True' creates a database index for faster lookups.

    product_id = Column(Integer, nullable=False)
    # Foreign key referencing the product that was purchased. Cannot be null.

    email = Column(String, nullable=False)

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

    date = Column(DateTime(timezone=True), nullable=False, default=datetime.now(timezone.utc))
    # Date when purchase was created