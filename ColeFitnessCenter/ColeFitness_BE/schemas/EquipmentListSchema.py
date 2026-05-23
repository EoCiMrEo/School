from pydantic import BaseModel

class EquipmentListSchema(BaseModel):
    EquipmentName: str
    Quantity: int

class EquipmentListUpdateSchema(BaseModel):
    Quantity: int = None