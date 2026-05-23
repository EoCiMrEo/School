from sqlalchemy import Column, Integer, VARCHAR, DATE, LargeBinary as BLOB, ForeignKey, FLOAT, event, DDL
from sqlalchemy.orm import mapped_column, relationship
from db.connectDB import Base

class Employee(Base):
    __tablename__ = "employee"

    # Define Columns
    EmployeeID = Column(Integer, primary_key=True, nullable=False, autoincrement=True, default=1, unique=True)
    FirstName = Column(VARCHAR(30), unique=True)
    MiddleName = Column(VARCHAR(30), nullable=True)
    LastName = Column(VARCHAR(30))
    Gender = Column(VARCHAR(10))
    DOB = Column(DATE)
    Picture = Column(BLOB, nullable=True)
    RoleKey = mapped_column(VARCHAR(10), ForeignKey("role.RoleKey"),nullable=True)

    # Initialize Relationships
    RoleRelationship = relationship("Role", backref="Employee")
    