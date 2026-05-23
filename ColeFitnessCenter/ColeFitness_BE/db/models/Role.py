from sqlalchemy import Column, Integer, VARCHAR
from db.connectDB import Base

class Role(Base):
    __tablename__ = "role"

    # Define Columns
    RoleID = Column(Integer, primary_key=True, autoincrement=True, default=1, unique=True)
    RoleKey = Column(VARCHAR(10), key="RoleKey", unique=True)
    RoleName = Column(VARCHAR(30), unique=True)