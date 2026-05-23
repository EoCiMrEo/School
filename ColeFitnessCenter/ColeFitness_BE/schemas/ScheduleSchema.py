from pydantic import BaseModel
from datetime import datetime

class ScheduleSchema(BaseModel):
    DateTime: datetime
    RoomID: int
    
class ScheduleUpdateSchema(BaseModel):
    DateTime: datetime = None
    RoomID: int = None