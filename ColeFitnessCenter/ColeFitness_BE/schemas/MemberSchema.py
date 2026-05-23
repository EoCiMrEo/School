from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class MemberSchema(BaseModel):
    FirstName: str
    MiddleName: str = None
    LastName: str
    DOB: date
    PhoneNumber: str
    EmailAddress: EmailStr
    Address: str
    Weight: Optional[float]
    Height: Optional[float]

class MemberUpdateSchema(BaseModel):
    FirstName: str = None
    MiddleName: str = None
    LastName: str = None
    DOB: date = None
    PhoneNumber: str = None
    EmailAddress: EmailStr = None
    Address: str = None
    Weight: Optional[float] = None
    Height: Optional[float] = None