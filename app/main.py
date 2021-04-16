import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from kitchenLibrary.app.routers import users, recipes, kitchen, ingredients

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

if __name__ == '__main__':
    uvicorn.run('kitchenLibrary.app.main:app', host='127.0.0.1', port=8000, reload=True)
