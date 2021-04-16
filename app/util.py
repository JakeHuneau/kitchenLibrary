import os
from typing import Optional, Any

from cryptography.fernet import Fernet
from pydantic import BaseModel
from sqlalchemy.orm import Session

from kitchenLibrary.app.models.user import User


class Response(BaseModel):
    """
    API response.
    """
    success: bool
    message: Optional[str] = ""
    data: Optional[Any] = None


fernet = Fernet(os.getenv('FERNET_KEY'))


def encrypt(text: str) -> str:
    """
    Encrypts a text
    """
    return fernet.encrypt(bytes(text)).decode('utf-8')


def decrypt(text: str) -> str:
    """
    Decrypts a text
    """
    return fernet.decrypt(bytes(text)).decode('utf-8')


def check_referenced_user_permissions(db: Session,
                                      user_id: str,
                                      can_write: bool,
                                      can_delete: bool,
                                      can_alter_users: bool) -> bool:
    """
    decrypts user id and checks if they have a permission
    """
    user_db = db.query(User).filter(User.id == decrypt(user_id.encode('utf-8'))).first()
    if not user_db:
        return False
    if not user_db.check_permissions(can_write, can_delete, can_alter_users):
        return False
    return True
