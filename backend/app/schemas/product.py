from pydantic import BaseModel
from enum import Enum

# Enumeration to define the allowed product categories.
# Enforces strict typing and value constraints on product type fields.
class ProductTypeEnum(str, Enum):
    bonsai = "bonsai"
    pot = "pot"
    accessory = "accessory"
    tools = "tools"
    supply = "supply"

# Pydantic model representing the schema for product data.
# Used for validation, serialization, and documentation in API requests/responses.
class Product(BaseModel):
    id: int
    # Unique identifier of the product.

    name: str
    # Human-readable name of the product.

    price: float
    # Price of the product, represented as a floating-point number.

    description: str
    # Detailed textual description providing product information.

    sourceImage: str
    # URL or path to the product's image resource.

    sourceModel: str
    # URL or path to the product's 3D model resource.

    type: ProductTypeEnum
    # Product category, restricted to one of the enumerated types.

    class Config:
        orm_mode = True
        # Enables compatibility with ORM objects,
        # allowing automatic data loading from SQLAlchemy models.

class ProductCreate(BaseModel):
    name: str
    price: float
    description: str
    sourceImage: str
    sourceModel: str
    type: ProductTypeEnum