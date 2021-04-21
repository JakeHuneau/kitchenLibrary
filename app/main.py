from fastapi import FastAPI
from mangum import Mangum
from starlette.middleware.cors import CORSMiddleware

from kitchenLibrary.app.routers import kitchen, users, recipes, ingredients

app = FastAPI()

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(recipes.router)
app.include_router(kitchen.router)
app.include_router(ingredients.router)

handler = Mangum(app=app)
