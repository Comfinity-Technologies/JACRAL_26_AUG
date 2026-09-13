import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.security.password import hash_password
from app.config import settings

logger = logging.getLogger(__name__)

ADMIN_USERS_SEED = [
    {
        "name": "System Admin",
        "email": settings.ADMIN_EMAIL,
        "password": settings.ADMIN_PASSWORD,
        "role": "ADMIN",
    },
    {
        "name": "Super Admin",
        "email": settings.SUPER_ADMIN_EMAIL,
        "password": settings.SUPER_ADMIN_PASSWORD,
        "role": "SUPER_ADMIN",
    },
    {
        "name": "Pro Admin",
        "email": settings.PRO_ADMIN_EMAIL,
        "password": settings.PRO_ADMIN_PASSWORD,
        "role": "PRO_ADMIN",
    },
]

def seed_admin_users():
    db: Session = SessionLocal()
    try:
        for seed in ADMIN_USERS_SEED:
            if not seed["email"] or not seed["password"]:
                continue
            existing_user = db.query(User).filter(User.email == seed["email"]).first()
            if not existing_user:
                new_user = User(
                    name=seed["name"],
                    email=seed["email"],
                    password_hash=hash_password(seed["password"]),
                    role=seed["role"],
                    is_active=True,
                )
                db.add(new_user)
                logger.info(f"Created admin user {seed['email']} with role {seed['role']}")
            else:
                existing_user.role = seed["role"]
                existing_user.password_hash = hash_password(seed["password"])
                existing_user.is_active = True
                logger.info(f"Updated admin user {seed['email']} with role {seed['role']}")
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding admin users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin_users()
