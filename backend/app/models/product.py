from sqlalchemy import Column, Integer, String, Text, Float, Enum as SQLAlchemyEnum
from enum import Enum
from app.db.database_connection import Base

class ProductTypeEnum(str, Enum):
    bonsai = "bonsai"
    pot = "pot"
    accessory = "accessory"
    tools = "tools"
    supply = "supply"

class ProductModel(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    sourceImage = Column(String, nullable=False)
    sourceModel = Column(String, nullable=False)
    type = Column(SQLAlchemyEnum(ProductTypeEnum, name="types_enum"), nullable=False)
