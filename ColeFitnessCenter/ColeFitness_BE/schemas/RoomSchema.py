from pydantic import BaseModel

class RoomSchema(BaseModel):
    RoomName: str
    RoomMaximum: int

class RoomUpdateSchema(BaseModel):
    RoomName: str = None
    RoomMaximum: int = None