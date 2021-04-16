from fastapi import APIRouter

from kitchenLibrary.app.util import Response
from kitchenLibrary.app.models import get_session, Ingredient

router = APIRouter()


@router.get('/ingredients', tags=['ingredients'], response_model=Response)
async def get_all_ingredients() -> Response:
    """
    Gets a list of all ingredient names
    """
    with get_session() as db:
        try:
            ingredients = db.query(Ingredient).all()
            return Response(success=True, data=[i.name for i in ingredients])
        except Exception as e:
            return Response(success=False, message=str(e))
