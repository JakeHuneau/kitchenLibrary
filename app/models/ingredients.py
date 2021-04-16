from pydantic import BaseModel
from sqlalchemy import Column, Integer, VARCHAR
from sqlalchemy.orm import relationship, validates

from kitchenLibrary.app.models.meta import Base


class IngredientInfo(BaseModel):
    """
    How much of an ingredient
    """
    name: str
    quantity: float
    unit: str
    required: bool


class Ingredient(Base):
    """
    Represents an ingredient
    """
    __tablename__ = 'ingredients'
    id = Column(Integer, primary_key=True)
    name = Column(VARCHAR(length=128), nullable=False, unique=True)

    recipe_ingredient = relationship('RecipeIngredient')

    def __repr__(self):
        return f'<Ingredient name={self.name}>'

    @validates('name')
    def lower_name(self, key, value):
        return value.lower()
