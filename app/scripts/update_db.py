from kitchenLibrary.app.models import get_engine
from kitchenLibrary.app.models.meta import Base


def main():
    engine = get_engine()
    Base.metadata.create_all(engine)


if __name__ == '__main__':
    main()
