from pydantic import BaseModel, EmailStr

class EmpContactSchema(BaseModel):
    EmployeeID: int
    PhoneNumber: str
    EmailAddress: EmailStr
    Address: str
    ContactType: str

class EmpContactUpdateSchema(BaseModel):
    EmpContactID: int
    PhoneNumber: str = None
    EmailAddress: EmailStr = None
    Address: str = None
    ContactType: str = None