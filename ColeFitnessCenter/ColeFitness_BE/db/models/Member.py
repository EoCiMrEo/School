from sqlalchemy import Column, Integer, String, VARCHAR, DATE, FLOAT, ForeignKey
from sqlalchemy.orm import mapped_column, relationship
from db.connectDB import Base

class Member(Base):
    __tablename__ = "member"

    # Defile Columns
    MemberID = Column(Integer, primary_key=True, autoincrement=True, default=1, nullable=False, unique=True)
    FirstName = Column(VARCHAR(30), unique=True)
    MiddleName = Column(VARCHAR(30), nullable=True)
    LastName = Column(VARCHAR(30))
    DOB = Column(DATE)
    PhoneNumber = Column(String, unique=True)
    EmailAddress = Column(String, unique=True)
    Address = Column(String)
    Weight = Column(FLOAT, nullable=True)
    Height = Column(FLOAT, nullable=True)
    MembershipID = mapped_column(Integer, ForeignKey("membership.MembershipID"), nullable=True)
    StartingDate = Column(DATE)
    ExpireDate = Column(DATE)
    
    # Initialize Relationships
    MembershipRelationship = relationship("Membership", backref="Member")
    