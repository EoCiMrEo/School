from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db import connectDB
from schemas.RoleSchema import RoleSchema, RoleUpdateSchema
from services.RoleServices import RoleServices

router = APIRouter(prefix="/role", tags=["role"])


@router.get("/getAllRole")
def getAllRole(db: Session = Depends(connectDB.connectDB)):
    data = RoleServices(db).getAllRole()
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get All Role !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get All Role !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.get("/getRoleByID/{id}")
def getRoleByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = RoleServices(db).getRoleByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get Role With This ID !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get Role By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.post("/createRole")
def createRole(role: RoleSchema, db: Session = Depends(connectDB.connectDB)):
    data = RoleServices(db).createRole(role)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Create Role !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Create Role !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_201_CREATED)
    return response

@router.put("/updateRoleByID/{id}")
def updateRoleByID(id: int, role: RoleUpdateSchema, db: Session = Depends(connectDB.connectDB)):
    data = RoleServices(db).updateRoleByID(id, role)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Update Role !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Update Role By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response

@router.delete("/deleteRoleByID/{id}")
def deleteRoleByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = RoleServices(db).deleteRoleByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Delete Role !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Deleted Role By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response
