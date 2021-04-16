from sqlalchemy import Column, Integer, ForeignKey

from kitchenLibrary.app.models.meta import Base


class Kitchen(Base):
    """
    What ingredients a user has
    """
    __tablename__ = 'kitchen'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    ingredient_id = Column(Integer, ForeignKey('ingredients.id'), nullable=False)

    def __repr__(self):
        return f'<Kitchen user={self.user_id} ingredient={self.ingredient_id}>'
