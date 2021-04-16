from pydantic import BaseModel
from sqlalchemy import Column, Integer, Text, VARCHAR
from sqlalchemy.orm import relationship, validates

from kitchenLibrary.app.models.meta import Base


class RecipeInfo(BaseModel):
    """
    Information about a recipe
    """
    name: str
    directions: str


class Recipe(Base):
    """
    Represents a recipe
    """
    __tablename__ = 'recipes'
    id = Column(Integer, primary_key=True)
    name = Column(VARCHAR(length=128), nullable=False, unique=True)
    directions = Column(Text, nullable=False)

    recipe_ingredient = relationship('RecipeIngredient')

    def __repr__(self):
        return f'<Recipe name={self.name}>'

    @validates('name')
    def lower_name(self, key, value):
        return value.lower()
