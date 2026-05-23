from pydantic import BaseModel
from datetime import date
from typing import Optional

class EmployeeSchema(BaseModel):
    FirstName: str
    MiddleName: str = None
    LastName: str
    DOB: date
    Gender: str
    # Weight: Optional[float]
    # Height: Optional[float]
class EmployeeUpdateSchema(BaseModel):
    FirstName: str = None
    MiddleName: str = None
    LastName: str = None
    DOB: date = None
    Gender: str = None
    # Weight: Optional[float] = None
    # Height: Optional[float] = None

    # = None means optional, allows null values