from sqlalchemy import Column, Integer, String, VARCHAR, DATE
from db.connectDB import Base

class Membership(Base):
    __tablename__ = "membership"

    # Define Columns
    MembershipID = Column(Integer, primary_key=True, autoincrement=True, default=1, unique=True)
    MembershipType = Column(VARCHAR(10), key="MembershipType", unique=True)
    MembershipPrice = Column(Integer)
    MembershipDescription = Column(String)
    MembershipDuration = Column(String)