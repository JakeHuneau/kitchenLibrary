from collections import defaultdict
from typing import List

from fastapi import APIRouter
from pydantic import BaseModel

from kitchenLibrary.app.models.ingredients import IngredientInfo, Ingredient
from kitchenLibrary.app.models.recipe_ingredients import RecipeIngredient
from kitchenLibrary.app.models.recipes import RecipeInfo, Recipe
from kitchenLibrary.app.util import Response, check_referenced_user_permissions
from kitchenLibrary.app.models import get_session

router = APIRouter()


class FullRecipe(BaseModel):
    """
    Includes information about a recipe and all the ingredients in it
    """
    recipe_info: RecipeInfo
    ingredients: List[IngredientInfo]


class NewRecipe(BaseModel):
    """
    Everything part of a new recipe
    """
    name: str
    ingredients: List[IngredientInfo]
    directions: str


@router.put('/recipes', tags=['recipes'], response_model=Response)
async def add_recipe(recipe: NewRecipe, reference_id: str) -> Response:
    """
    Adds a new recipe to the database
    """
    with get_session() as db:
        try:
            if not check_referenced_user_permissions(db, reference_id, True, False, False):
                return Response(success=False, message='Reference user cannot perform this operation')
            if db.query(Recipe).filter(Recipe.name == recipe.name).first():
                # No duplicates
                return Response(success=False, message="Recipe already exists.")

            recipe_db = Recipe(name=recipe.name, directions=recipe.directions)
            db.add(recipe_db)

            for ingredient in recipe.ingredients:
                ingredient_db = db.query(Ingredient).filter(Ingredient.name == ingredient.name).first()
                if not ingredient_db:
                    # New ingredient, need to add it
                    ingredient_db = Ingredient(name=ingredient.name)
                    db.add(ingredient_db)
                    db.flush()
                link = RecipeIngredient(recipe_id=recipe_db.id,
                                        ingredient_id=ingredient_db.id,
                                        quantity=ingredient.quantity,
                                        unit=ingredient.unit,
                                        required=ingredient.required)
                db.add(link)
            db.commit()
            return Response(success=True)

        except Exception as e:
            return Response(success=False, message=str(e))


@router.delete('/recipes/{name}', tags=['recipes'], response_model=Response)
def delete_recipe(recipe_name: str, reference_id: str) -> Response:
    """
    Deletes a recipe from the database.
    """
    with get_session() as db:
        try:
            if not check_referenced_user_permissions(db, reference_id, False, True, False):
                return Response(success=False, message='Reference user cannot perform this operation')
            recipe = db.query(Recipe).filter(Recipe.name == recipe_name.lower()).first()
            if not recipe:
                return Response(success=False, message='Recipe not found.')
            ingredient_ids = {r.ingredient_id for r in
                              db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == recipe.id).all()}

            db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == recipe.id).delete()
            db.delete(recipe)

            for ingredient_id in ingredient_ids:
                remaining_recipes = db.query(RecipeIngredient).filter(
                    RecipeIngredient.ingredient_id == ingredient_id).count()
                if not remaining_recipes:  # Remove orphans
                    db.query(Ingredient).filter(Ingredient.id == ingredient_id).delete()
            db.commit()
            return Response(success=True)
        except Exception as e:
            return Response(success=False, message=str(e))


@router.post('/recipes/search/{name}', tags=['recipes'], response_model=Response)
async def get_recipe(name: str) -> Response:
    """
    Gets a recipe from the database using the name
    """
    with get_session() as db:
        recipes = db.query(Recipe, RecipeIngredient, Ingredient) \
            .join(RecipeIngredient, Recipe.id == RecipeIngredient.recipe_id) \
            .join(Ingredient, RecipeIngredient.ingredient_id == Ingredient.id) \
            .filter(Recipe.name == name.lower()).all()
        if not recipes:
            return Response(success=False, message="Recipe not found.")
        recipe_info = RecipeInfo(name=recipes[0][0].name, directions=recipes[0][0].directions)

        ingredients_info = []
        for recipe in recipes:
            ingredients_info.append(
                IngredientInfo(name=recipe[2].name, quantity=recipe[1].quantity, unit=recipe[1].unit,
                               required=recipe[1].required))
        return Response(success=True,
                        data=FullRecipe(recipe_info=recipe_info,
                                        ingredients=ingredients_info))


@router.post('/recipes/match_any', tags=['recipes'], response_model=Response)
def get_all_recipes(ingredients: List[str]) -> Response:
    """
    Finds all the recipes that can be made with anything in the list of ingredients
    """
    with get_session() as db:
        try:
            recipes = dict()
            # Find all the ingredients with the given names
            found_recipes = db.query(Ingredient, RecipeIngredient, Recipe) \
                .join(RecipeIngredient, Ingredient.id == RecipeIngredient.ingredient_id) \
                .join(Recipe, RecipeIngredient.recipe_id == Recipe.id) \
                .filter(Ingredient.name.in_(ingredients)).all()

            for recipe in found_recipes:
                if not recipe[1].recipe_id in recipes:
                    # If we don't have the recipe already, add it to the list with all the ingredients in it
                    ingredients = [
                        IngredientInfo(name=ing[0].name,
                                       quantity=ing[1].quantity,
                                       unit=ing[1].unit,
                                       required=ing[1].required) for
                        ing in db.query(Ingredient, RecipeIngredient)
                            .join(RecipeIngredient, RecipeIngredient.ingredient_id == Ingredient.id)
                            .filter(RecipeIngredient.recipe_id == recipe[1].recipe_id)
                            .all()]
                    recipes[recipe[1].recipe_id] = FullRecipe(
                        recipe_info=RecipeInfo(name=recipe[2].name, directions=recipe[2].directions),
                        ingredients=ingredients)
            return Response(success=True, data=list(recipes.values()))
        except Exception as e:
            return Response(success=False, message=str(e))


@router.post('/recipes/match_all', tags=['recipes'], response_model=Response)
def get_matching_recipes(ingredients: List[str]) -> Response:
    """
    Finds all the recipes that can be made with the list of ingredients
    """
    with get_session() as db:
        try:
            # Find all the ingredients and recipes with those
            found_recipes = db.query(Ingredient, RecipeIngredient, Recipe) \
                .join(RecipeIngredient, Ingredient.id == RecipeIngredient.ingredient_id) \
                .join(Recipe, RecipeIngredient.recipe_id == Recipe.id) \
                .filter(Ingredient.name.in_(ingredients)) \
                .all()

            # Find all the recipes that match the ingredients and build a dict for each recipe that will hold
            # a set of all the found ingredients
            recipe_pieces = defaultdict(list)
            recipe_info = dict()

            for recipe in found_recipes:
                if recipe[2].id not in recipe_info:
                    recipe_info[recipe[2].id] = RecipeInfo(name=recipe[2].name, directions=recipe[2].directions)
                recipe_pieces[recipe[2].id].append(IngredientInfo(
                    name=recipe[0].name,
                    quantity=recipe[1].quantity,
                    unit=recipe[1].unit,
                    required=recipe[1].required
                ))

            # Search for the full recipe for each possible recipe and see if we have all the required ingredients for it
            full_recipes = list()
            for recipe_id in recipe_info.keys():
                # IngredientInfo objects of the full ingredients for this recipe
                full_ingredients = [
                    IngredientInfo(name=r[1].name,
                                   quantity=r[0].quantity,
                                   unit=r[0].unit,
                                   required=r[0].required) for r in db.query(RecipeIngredient, Ingredient)
                        .join(Ingredient, Ingredient.id == RecipeIngredient.ingredient_id)
                        .filter(RecipeIngredient.recipe_id == recipe_id)
                        .all()]

                # Only check on ingredients that are required
                non_required_full_ingredients = len([r for r in full_ingredients if r.required])
                non_required_found_ingredients = len([r for r in recipe_pieces[recipe_id] if r.required])
                if non_required_full_ingredients == non_required_found_ingredients:
                    # If we have everything then pass it
                    full_recipes.append(FullRecipe(
                        recipe_info=recipe_info[recipe_id],
                        ingredients=full_ingredients
                    ))

            return Response(success=True, data=full_recipes)
        except Exception as e:
            return Response(success=False, message=str(e))
