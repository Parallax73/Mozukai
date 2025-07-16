from pydantic import BaseModel
from enum import Enum

class ProductTypeEnum(str, Enum):
    bonsai = "bonsai"
    pot = "pot"
    accessory = "accessory"
    tools = "tools"
    supply = "supply"

class Product(BaseModel):
    id: int
    name: str
    price: float
    description: str
    sourceImage: str
    sourceModel: str
    type: ProductTypeEnum

    class Config:
        orm_mode = True
