from sqlalchemy import Column, Integer, Text, ForeignKey, Float, Boolean

from kitchenLibrary.app.models.meta import Base


class RecipeIngredient(Base):
    """
    1 to many with Recipe -> self, Ingredients -> self
    """
    __tablename__ = 'recipe_ingredients'
    id = Column(Integer, primary_key=True)
    recipe_id = Column(Integer, ForeignKey('recipes.id'), nullable=False)
    ingredient_id = Column(Integer, ForeignKey('ingredients.id'), nullable=False)
    quantity = Column(Float)
    unit = Column(Text)
    required = Column(Boolean, nullable=False)  # 0 means optional, 1 is required

    def __repr__(self):
        return f'<RecipeIngredient recipe={self.recipe_id} ingredient={self.ingredient_id}>'
