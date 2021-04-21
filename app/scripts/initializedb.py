from kitchenLibrary.app.models import (
    get_engine,
    get_session
)
from kitchenLibrary.app.models.ingredients import Ingredient
from kitchenLibrary.app.models.kitchen import Kitchen
from kitchenLibrary.app.models.meta import Base
from kitchenLibrary.app.models.recipe_ingredients import RecipeIngredient
from kitchenLibrary.app.models.recipes import Recipe
from kitchenLibrary.app.models.user import User


def main():
    engine = get_engine()
    Base.metadata.create_all(engine)


    with get_session() as db:

        jake = User(name='Jake', permissions=4)
        jake.set_password('hunter2')
        jake.set_permissions(True, True, True)
        db.add(jake)

        peanut_butter = Ingredient(name='peanut_butter')
        jelly = Ingredient(name='jelly')
        bread = Ingredient(name='bread')
        cheese = Ingredient(name='cheese')
        butter = Ingredient(name='butter')
        ham = Ingredient(name='ham')
        apple = Ingredient(name='apple')
        db.add_all([peanut_butter, jelly, bread, cheese, butter, ham, apple])

        pbj = Recipe(name='peanutbutter and jelly',
                     directions='1. Put peanut butter on bread.\n'
                                '2. put jelly on bread.\n'
                                '3. Put bread togther.\n')
        db.add(pbj)
        db.flush()

        link1 = RecipeIngredient(recipe_id=pbj.id,
                                 ingredient_id=peanut_butter.id,
                                 quantity=1,
                                 unit='oz',
                                 required=1)
        link2 = RecipeIngredient(recipe_id=pbj.id,
                                 ingredient_id=jelly.id,
                                 quantity=1,
                                 unit='oz',
                                 required=1)
        link3 = RecipeIngredient(recipe_id=pbj.id,
                                 ingredient_id=bread.id,
                                 quantity=2,
                                 unit='slice',
                                 required=1)

        db.add_all([link1, link2, link3])

        grilled_cheese = Recipe(name='Grilled Cheese',
                                directions='1. Heat pan.\n'
                                           '2. Butter outside of bread.\n'
                                           '3. Put cheese in between bread.\n'
                                           '4. Grilled bread\n'
                                           '5. Optionally, add ham inside')
        db.add(grilled_cheese)
        db.flush()

        gc_link1 = RecipeIngredient(recipe_id=grilled_cheese.id,
                                    ingredient_id=cheese.id,
                                    quantity=1,
                                    unit='slice',
                                    required=1)
        gc_link2 = RecipeIngredient(recipe_id=grilled_cheese.id,
                                    ingredient_id=bread.id,
                                    quantity=2,
                                    unit='slice',
                                    required=1)
        gc_link3 = RecipeIngredient(recipe_id=grilled_cheese.id,
                                    ingredient_id=butter.id,
                                    quantity=1,
                                    unit='oz',
                                    required=1)
        gc_link4 = RecipeIngredient(recipe_id=grilled_cheese.id,
                                    ingredient_id=apple.id,
                                    quantity=3,
                                    unit='slice',
                                    required=0)

        db.add_all([gc_link1, gc_link2, gc_link3, gc_link4])

        k_link1 = Kitchen(user_id=jake.id,
                          ingredient_id=peanut_butter.id)
        k_link2 = Kitchen(user_id=jake.id,
                          ingredient_id=jelly.id)
        k_link3 = Kitchen(user_id=jake.id,
                          ingredient_id=bread.id)
        k_link4 = Kitchen(user_id=jake.id,
                          ingredient_id=cheese.id)
        k_link5 = Kitchen(user_id=jake.id,
                          ingredient_id=apple.id)
        db.add_all([k_link1, k_link2, k_link3, k_link4, k_link5])

        db.commit()

if __name__ == '__main__':
    main()
