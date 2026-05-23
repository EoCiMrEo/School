from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db import connectDB
from schemas.EquipmentMaintenanceSchema import EquipmentMaintenanceSchema, EquipmentMaintenanceUpdateSchema
from services.EquipmentMaintenanceServices import EquipmentMaintenanceServices

router = APIRouter(prefix="/equipment", tags=["equipment_maintenance"])

@router.get("/getAllEquipmentMaintenance")
def getAllEquipmentMaintenance(db: Session = Depends(connectDB.connectDB)):
    data = EquipmentMaintenanceServices(db).getAllEquipmentMaintenance()
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get All Equipment Maintenance !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get All Equipment Maintenance !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.get("/getEquipmentMaintenanceByID/{id}")
def getEquipmentMaintenanceByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = EquipmentMaintenanceServices(db).getEquipmentMaintenanceByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get Equipment Maintenance With This ID !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get Equipment Maintenance By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.post("/createEquipmentMaintenance")
def createEquipmentMaintenance(EquipmentMaintenance: EquipmentMaintenanceSchema, db: Session = Depends(connectDB.connectDB)):
    data = EquipmentMaintenanceServices(db).createEquipmentMaintenance(EquipmentMaintenance)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Create Equipment Maintenance !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Created Equipment Maintenance !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_201_CREATED)
    return response

@router.put("/updateEquipmentMaintenanceByID/{id}")
def updateEquipmentMaintenanceByID(id: int, EquipmentMaintenance: EquipmentMaintenanceUpdateSchema, db: Session = Depends(connectDB.connectDB)):
    data = EquipmentMaintenanceServices(db).updateEquipmentMaintenanceByID(id, EquipmentMaintenance)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Update Equipment Maintenance !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Updated Equipment Maintenance By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response

@router.delete("/deleteEquipmentMaintenanceByID/{id}")
def deleteEquipmentMaintenanceByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = EquipmentMaintenanceServices(db).deleteEquipmentMaintenanceByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Delete Equipment Maintenance !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Deleted Equipment Maintenance By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response