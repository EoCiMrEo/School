from sqlalchemy import Column, Integer, VARCHAR, ForeignKey, DATE
from sqlalchemy.orm import mapped_column, relationship
from db.connectDB import Base

class Equipment(Base):
    __tablename__ = "equipment"

    # Define Columns
    EquipmentID = Column(Integer, primary_key=True, autoincrement=True, default=1)
    EquipmentName = Column(VARCHAR(30), unique=True)
    PurchasedDate = Column(DATE)
    BranchID = mapped_column(Integer, ForeignKey("branch.BranchID"), nullable=True)

    # Initialize Relationships
    BranchRelationship = relationship("Branch", backref="Equipment")
    