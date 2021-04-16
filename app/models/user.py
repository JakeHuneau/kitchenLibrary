import bcrypt
from sqlalchemy import Column, Integer, BINARY, VARCHAR
from sqlalchemy.dialects.mysql import TINYINT

from kitchenLibrary.app.models.meta import Base


class User(Base):
    """
    Represents a user
    """
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(VARCHAR(256), nullable=False, unique=True)
    password = Column(BINARY(60), nullable=False)
    permissions = Column(TINYINT, default=0, nullable=False)  # 0 = read, 1 = write, 2 = delete, 4 = change users

    def __repr__(self):
        return f'<User name={self.name}>'

    def set_password(self, password: str) -> None:
        """
        Sets a new password by hashing the given password.
        """
        password_hash = bcrypt.hashpw(str.encode(password), bcrypt.gensalt())
        self.password = password_hash

    def check_password(self, password: str) -> bool:
        """
        Returns:
             if a password is correct by comparing to what is in the database
        """
        if self.password is not None:
            return bcrypt.checkpw(str.encode(password), self.password)
        return False

    def set_permissions(self, can_write: bool, can_delete: bool, can_change_users: bool) -> None:
        """
        Sets the permissions for a user.

        Arguments:
            can_write: If user can write new recipes
            can_delete: If user can delete recipes
            can_change_users: If user can change permissions of other users
        """
        self.permissions = can_write + 2 * can_delete + 4 * can_change_users

    def check_permissions(self, can_write: bool, can_delete: bool, can_change_users: bool) -> bool:
        """
        Checks a user's permissions
        """
        return self.permissions & (can_write + 2 * can_delete + 4 * can_change_users) == \
               can_write + 2 * can_delete + 4 * can_change_users
