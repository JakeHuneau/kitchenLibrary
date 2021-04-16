from typing import Optional

from fastapi import APIRouter

from kitchenLibrary.app.util import Response, encrypt, check_referenced_user_permissions, decrypt
from kitchenLibrary.app.models import User, get_session, Kitchen

router = APIRouter()


@router.put('/users/{username}', tags=['users'], response_model=Response)
async def add_user(username: str, password: str, can_write: Optional[bool] = False, can_delete: Optional[bool] = False,
                   can_alter_users: Optional[bool] = False) -> Response:
    """
    Adds a new user to the database.
    """
    with get_session() as db:
        if db.query(User).filter(User.name == username).count():
            return Response(success=False, message="User already exists.")

        new_user = User(name=username)
        new_user.set_password(password)
        new_user.set_permissions(can_write, can_delete, can_alter_users)

        db.add(new_user)
        db.commit()
        return Response(success=True)


@router.post('/users/signIn/{username}', tags=['users'], response_model=Response)
async def sign_in(username: str, password: str) -> Response:
    """
    Tries to log a user in.

    Returns:
        Response with encrypted username as data
    """
    with get_session() as db:
        try:
            user_db = db.query(User).filter(User.name == username).first()
            if not user_db:
                return Response(success=False, message='User not found.')
            if not user_db.check_password(password):
                return Response(success=False, message='Password incorrect')
            return Response(success=True, data=encrypt(str(user_db.id).encode('utf-8')))
        except Exception as e:
            return Response(success=False, message=str(e))


@router.put('/users/updatePermissions/{username}', tags=['users'], response_model=Response)
async def update_permissions(username: str, reference_id: str, can_write: Optional[bool] = False, can_delete: Optional[bool] = False,
                             can_alter_users: Optional[bool] = False) -> Response:
    """
    Updates permissions on a user
    """
    with get_session() as db:
        try:
            if not check_referenced_user_permissions(db, reference_id, False, False, True):
                return Response(success=False, message='Reference user cannot perform this operation')
            user_db = db.query(User).filter(User.name == username).first()
            if not user_db:
                return Response(success=False, message="User not found.")
            user_db.set_permissions(can_write, can_delete, can_alter_users)
            db.commit()
            return Response(success=True)
        except Exception as e:
            return Response(success=False, message=str(e))


@router.put('/users/updatePassword/{user_id}', tags=['users'], response_model=Response)
async def update_password(user_id: str, password: str) -> Response:
    """
    Updates password on a user
    """
    with get_session() as db:
        try:
            user_db = db.query(User).filter(User.name == decrypt(user_id)).first()
            if not user_db:
                return Response(success=False, message="User not found.")
            user_db.set_password(password)
            db.commit()
            return Response(success=True)
        except Exception as e:
            return Response(success=False, message=str(e))


@router.delete('/users/{username}', tags=['users'], response_model=Response)
async def delete_user(username: str, reference_id: str) -> Response:
    """
    Deletes a user from the database
    """
    with get_session() as db:
        try:
            if not check_referenced_user_permissions(db, reference_id, False, False, True):
                return Response(success=False, message='Reference user cannot perform this operation')
            user_db = db.query(User).filter(User.name == username).first()
            if not user_db:
                return Response(success=False, message="User not found.")
            db.query(Kitchen).filter(Kitchen.user_id == user_db.id).delete()  # Delete their kitchen first
            db.delete(user_db)
            db.commit()
            return Response(success=True)
        except Exception as e:
            return Response(success=False, message=str(e))
