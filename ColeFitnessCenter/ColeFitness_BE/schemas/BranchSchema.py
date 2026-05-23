from pydantic import BaseModel, EmailStr

class BranchSchema(BaseModel):
    BranchName: str
    BranchAddress: str
    BranchPhoneNumber: str
    BranchEmailAddress: EmailStr

class BranchUpdateSchema(BaseModel):
    BranchName: str = None
    BranchAddress: str = None
    BranchPhoneNumber: str = None
    BranchEmailAddress: EmailStr = None