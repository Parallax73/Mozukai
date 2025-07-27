from sqlalchemy import Column, Integer, String, ARRAY
from sqlalchemy.orm import declarative_base

# Base class for all ORM models. Required for SQLAlchemy to manage metadata.
Base = declarative_base()

# SQLAlchemy model representing a user entity.
# Each instance maps to a row in the 'users' table.
class User(Base):
    __tablename__ = "users"  # Name of the table in the database.

    id = Column(Integer, primary_key=True, index=True)
    # Unique identifier for the user. Acts as the primary key and is indexed for efficient lookups.

    email = Column(String, unique=True, index=True, nullable=False)
    # User's email address. Must be unique and not null. Indexed for fast authentication queries.

    password = Column(String, nullable=False)
    # Hashed password used for authentication. Cannot be null.

    product_cart = Column(ARRAY(Integer), default=list)
    # List of product IDs representing items in the user's cart.
    # Uses PostgreSQL ARRAY type to store multiple integers. Defaults to an empty list.
