import os

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import configure_mappers
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.session import Session

from kitchenLibrary.app.models.kitchen import Kitchen
from kitchenLibrary.app.models.ingredients import Ingredient, IngredientInfo
from kitchenLibrary.app.models.recipes import Recipe, RecipeInfo
from kitchenLibrary.app.models.user import User
from kitchenLibrary.app.models.recipe_ingredients import RecipeIngredient

configure_mappers()


def get_engine() -> Engine:
    endpoint = 'recipes.cbrohh83x5d7.us-east-2.rds.amazonaws.com'
    port = 3306
    username = 'admin'
    password = os.getenv('DB_PASSWORD')

    engine = create_engine(f'mysql+pymysql://{username}:{password}@{endpoint}:{port}/recipes', echo=True)
    return engine


def get_session() -> Session:
    Session = sessionmaker(bind=get_engine())
    return Session()
