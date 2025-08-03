from sqlalchemy import Column, Integer, String, Text, Float, Enum as SQLAlchemyEnum
from enum import Enum
from app.db.database_connection import Base
from app.schemas.product import ProductTypeEnum



# SQLAlchemy model representing a product entity.
# Each instance corresponds to a row in the 'products' table.
class ProductModel(Base):
    __tablename__ = "products"  # Defines the name of the table in the database.

    id = Column(Integer, primary_key=True, index=True)
    # Unique identifier for the product (auto-incremented primary key).

    name = Column(String, nullable=False)
    # Name of the product. Cannot be null.

    price = Column(Float, nullable=False)
    # Price of the product as a floating-point value. Cannot be null.

    description = Column(Text, nullable=False)
    # Detailed textual description of the product. Cannot be null.

    sourceImage = Column(String, nullable=False)
    # Path or URL to the product's image. Cannot be null.

    sourceModel = Column(String, nullable=False)
    # Path or URL to the product's 3D model file. Cannot be null.

    type = Column(SQLAlchemyEnum(ProductTypeEnum, name="types_enum"), nullable=False)
    # Product category, restricted to the defined ProductTypeEnum values. Cannot be null.
