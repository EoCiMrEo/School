from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import mapped_column, relationship
from db.connectDB import Base

class EquipmentMaintenance(Base):
    __tablename__ = "equipment_maintenance"

    # Define Columns
    EquipmentMaintenanceID = Column(Integer, primary_key=True, autoincrement=True, default=1)
    Description = Column(String)
    Duration = Column(String)
    Cost = Column(Integer)
    EquipmentID = mapped_column(Integer, ForeignKey("equipment.EquipmentID"), nullable=True)

    # Initialize Relationship
    EquipmentRelationship = relationship("Equipment", backref="EquipmentMaintenance")
    