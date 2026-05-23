from pydantic import BaseModel

class EmpAccountSchema(BaseModel):
    EmployeeID: int
    UserName: str
    Password: str

class EmpAccountPasswordUpdateSchema(BaseModel):
    Password: str