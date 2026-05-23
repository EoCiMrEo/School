from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db import connectDB
from schemas.RoomSchema import RoomSchema, RoomUpdateSchema
from services.RoomServices import RoomServices

router = APIRouter(prefix="/room", tags=["room"])

@router.get("/getAllRoom")
def getAllRoom(db: Session = Depends(connectDB.connectDB)):
    data = RoomServices(db).getAllRoom()
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get All Room !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get All Room !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.get("/getRoomByID/{id}")
def getRoomByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = RoomServices(db).getRoomByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get Room With This ID !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get Room By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.post("/createRoom")
def createRoom(room: RoomSchema, db: Session = Depends(connectDB.connectDB)):
    data = RoomServices(db).createRoom(room)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Create Room !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Create Room !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_201_CREATED)
    return response

@router.put("/updateRoomByID/{id}")
def updateRoomByID(id: int, room: RoomUpdateSchema, db: Session = Depends(connectDB.connectDB)):
    data = RoomServices(db).updateRoomByID(id, room)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Update Room !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Update Room By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response

@router.delete("/deleteRoomByID/{id}")
def deleteRoomByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = RoomServices(db).deleteRoomByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Delete Room !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Deleted Room By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response
