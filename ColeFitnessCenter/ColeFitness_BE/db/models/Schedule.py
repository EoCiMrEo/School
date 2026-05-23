from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP
from sqlalchemy.orm import mapped_column, relationship
from db.connectDB import Base

class Schedule(Base):
    __tablename__ = "schedule"

    # Define Columns
    ScheduleID = Column(Integer, primary_key=True, autoincrement=True, default=1)
    DateTime = Column(TIMESTAMP)
    RoomID = mapped_column(Integer, ForeignKey("room.RoomID"), nullable=True, unique=True)

    # Initialize Relationships
    RoomRelationship = relationship("Room", backref="Schedule")
    