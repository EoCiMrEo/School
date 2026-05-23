from pydantic import BaseModel
from datetime import date

class MembershipSchema(BaseModel):
    MembershipType: str
    MembershipPrice: int
    MembershipDescription: str
    MembershipDuration: str
    StartingDate: date
    ExpireDate: date

class MembershipUpdateSchema(BaseModel):
    MembershipType: str = None
    MembershipPrice: int = None
    MembershipDescription: str = None
    MembershipDuration: str = None