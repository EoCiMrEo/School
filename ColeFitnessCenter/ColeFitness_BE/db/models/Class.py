from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP
from sqlalchemy.orm import mapped_column, relationship
from db.connectDB import Base

class Class(Base):
    __tablename__ = "class"

    # Define Columns
    ClassID = Column(Integer, primary_key=True, autoincrement=True, default=1)
    ClassTitle = Column(String, unique=True)
    ScheduleID = mapped_column(Integer, ForeignKey("schedule.ScheduleID"), nullable=True)
    EmployeeID = mapped_column(Integer, ForeignKey("employee.EmployeeID"), nullable=True)

    # Initialize Relationships
    ScheduleRelationship = relationship("Schedule", backref="Class")
    EmployeeRelationship = relationship("Employee", backref="Class")
    