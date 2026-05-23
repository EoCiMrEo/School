from pydantic import BaseModel
from datetime import date

class EquipmentSchema(BaseModel):
    EquipmentName: str
    PurchasedDate: date

class EquipmentUpdateSchema(BaseModel):
    EquipmentName: str = None
    PurchasedDate: date = None

