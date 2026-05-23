from pydantic import BaseModel
from datetime import datetime

class ClassSchema(BaseModel):
    ClassTitle: str
    DateTime: datetime

class ClassUpdateSchema(BaseModel):
    ClassTitle: str = None
    DateTime: datetime = None