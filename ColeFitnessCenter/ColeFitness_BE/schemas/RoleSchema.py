from pydantic import BaseModel

class RoleSchema(BaseModel):
    RoleName: str
    RoleKey: str

class RoleUpdateSchema(BaseModel):
    RoleName: str = None
    RoleKey: str = None