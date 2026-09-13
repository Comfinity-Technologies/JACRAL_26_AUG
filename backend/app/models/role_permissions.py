from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.database import Base

class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(50), nullable=False, index=True) # e.g. 'ADMIN' or 'SUPER_ADMIN'
    page = Column(String(100), nullable=False) # e.g. '/admin/users'
    can_access = Column(Boolean, default=True)
