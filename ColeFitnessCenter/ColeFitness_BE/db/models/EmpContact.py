from sqlalchemy import Column, Integer, String, VARCHAR, ForeignKey
from sqlalchemy.orm import mapped_column, relationship
from db.connectDB import Base

class EmpContact(Base):
    __tablename__ = "emp_contact"
    EmpContactID = Column(Integer, primary_key=True, autoincrement=True, default=1)
    PhoneNumber = Column(String, unique=True)
    EmailAddress = Column(String, unique=True)
    Address = Column(String)
    ContactType = Column(VARCHAR(5))
    EmployeeID = mapped_column(Integer, ForeignKey("employee.EmployeeID"), nullable=True)

    # Initialize Relationships
    EmployeeRelationship = relationship("Employee", backref="EmpContact")
    