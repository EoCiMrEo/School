from sqlalchemy import String, Column, Integer, ForeignKey, VARCHAR
from sqlalchemy.orm import relationship, mapped_column
from db.connectDB import Base

class Branch(Base):
    __tablename__ = "branch"

    # Define Columns
    BranchID = Column(Integer, primary_key=True, autoincrement=True)
    BranchName = Column(VARCHAR(30), unique=True)
    BranchPhoneNumber = Column(VARCHAR(15))
    BranchEmailAddress = Column(String)
    BranchAddress = Column(String, unique=True)
    EmployeeID = mapped_column(Integer, ForeignKey("employee.EmployeeID"), nullable=True)
    
    # Initialize Relationships
    EmployeeRelationship = relationship("Employee", backref="Branch")