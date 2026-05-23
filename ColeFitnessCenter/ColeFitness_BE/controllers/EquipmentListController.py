from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db import connectDB
from schemas.EquipmentListSchema import EquipmentListSchema, EquipmentListUpdateSchema
from services.EquipmentListServices import EquipmentListServices

router = APIRouter(prefix="/equipment", tags=["equipment_list"])

@router.get("/getAllEquipmentList")
def getAllEquipmentList(db: Session = Depends(connectDB.connectDB)):
    data = EquipmentListServices(db).getAllEquipmentList()
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get All Equipment List !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get All Equipment List !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.get("/getEquipmentListByID/{id}")
def getEquipmentListByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = EquipmentListServices(db).getEquipmentListByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get Equipment List With This ID !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get Equipment List By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.post("/createEquipmentList")
def createEquipmentList(Equipment: EquipmentListSchema, db: Session = Depends(connectDB.connectDB)):
    data = EquipmentListServices(db).createEquipmentList(Equipment)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Create Equipment List !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Created Equipment List !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_201_CREATED)
    return response

@router.put("/updateEquipmentListByID/{id}")
def updateEquipmentListByID(id: int, Equipment: EquipmentListUpdateSchema, db: Session = Depends(connectDB.connectDB)):
    data = EquipmentListServices(db).updateEquipmentListByID(id, Equipment)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Update Equipment List !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Updated Equipment List By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response

@router.delete("/deleteEquipmentListByID/{id}")
def deleteEquipmentListByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = EquipmentListServices(db).deleteEquipmentListByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Delete Equipment List !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Deleted Equipment List By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response
