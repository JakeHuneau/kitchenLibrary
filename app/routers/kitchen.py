from typing import List

from fastapi import APIRouter
from sqlalchemy import and_

from kitchenLibrary.app.models.ingredients import Ingredient
from kitchenLibrary.app.models.kitchen import Kitchen
from kitchenLibrary.app.models.user import User
from kitchenLibrary.app.util import Response, decrypt
from kitchenLibrary.app.models import get_session

router = APIRouter()


@router.get('/kitchen/{user_id}', tags=['kitchen'], response_model=Response)
async def get_kitchen_contents(user_id: str) -> Response:
    """
    Gets all the ingredients a user has in their kitchen
    """
    with get_session() as db:
        try:
            user_db  = db.query(User).filter(User.id == decrypt(user_id)).first()

            if not user_db:
                return Response(success=False, message="No kitchen found for user.")

            # Join kitchen to ingredients to get names of all ingredients user has
            ingredients = db.query(Ingredient)\
                .join(Kitchen, Ingredient.id == Kitchen.ingredient_id)\
                .filter(Kitchen.user_id == user_db.id)\
                .all()

            return Response(success=True, data={ingredient.name for ingredient in ingredients})
        except Exception as e:
            return Response(success=False, message=str(e))


@router.put('/kitchen/{user_id}', tags=['kitchen'], response_model=Response)
async def update_kitchen(user_id: str, ingredients: List[str]):
    """
    Updates a user's kitchen
    """
    with get_session() as db:
        try:
            user_db = db.query(User).filter(User.id == decrypt(user_id)).first()
            if not user_db:
                return Response(success=False, message="User not found.")

            # Make sets of what user has in DB and what they have now
            user_ingredients = {k.ingredient_id for k in db.query(Kitchen).filter(Kitchen.user_id == user_db.id).all()}
            ingredient_ids = {k.id for k in db.query(Ingredient).filter(Ingredient.name.in_(ingredients)).all()}

            # Find the set differences to know what to add and delete
            to_add = ingredient_ids - user_ingredients
            to_remove = user_ingredients - ingredient_ids

            for add_id in to_add:
                db.add(Kitchen(user_id=user_db.id, ingredient_id=add_id))
            for delete_id in to_remove:
                db.query(Kitchen).filter(and_(Kitchen.user_id == user_db.id, Kitchen.ingredient_id == delete_id)).delete()

            db.commit()
            return Response(success=True)
        except Exception as e:
            return Response(success=False, message=str(e))