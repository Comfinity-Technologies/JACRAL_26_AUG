from sqlalchemy import text

from app.database import engine


def test_database_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT current_database();")
            )

            database_name = result.scalar()

            print(
                f"Database connection successful: {database_name}"
            )

    except Exception as error:
        print("Database connection failed.")
        print(error)


if __name__ == "__main__":
    test_database_connection()