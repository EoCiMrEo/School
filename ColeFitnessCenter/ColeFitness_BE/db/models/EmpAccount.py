from sqlalchemy import Column, Integer, String, Boolean, VARCHAR, ForeignKey
from sqlalchemy.orm import mapped_column, relationship
from db.connectDB import Base

class EmpAccount(Base):
    __tablename__ = "emp_account"
    # Define Columns
    EmpAccountID = Column(Integer, primary_key=True, autoincrement=True, default=1)
    UserName = Column(VARCHAR(35), unique=True)
    Password = Column(String)
    Status = Column(Boolean, default=False)
    EmployeeID = mapped_column(Integer, ForeignKey("employee.EmployeeID"), nullable=True)

    # Initialize Relationships
    EmployeeRelationship = relationship("Employee", backref="EmpAccount")