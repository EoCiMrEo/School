from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db import connectDB
from schemas.EmpContactSchema import EmpContactSchema, EmpContactUpdateSchema
from services.EmpContactServices import EmpContactServices

router = APIRouter(prefix="/employee", tags=["employee_contact"])

@router.get("/getAllEmpContact")
def getAllEmpContact(db: Session = Depends(connectDB.connectDB)):
    data = EmpContactServices(db).getAllEmpContact()
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get All Employee Contact !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get All Contact !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.get("/getAllContactByEmpID/{id}")
def getAllContactByEmpID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = EmpContactServices(db).getAllContactByEmpID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get Contact With Employee ID !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get Employee Contact By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.post("/createEmpContact")
def createEmpContact(contact: EmpContactSchema, db: Session = Depends(connectDB.connectDB)):
    data = EmpContactServices(db).createEmpContact(contact)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Creat New Employee Contact !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Created Employee Contact !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_201_CREATED)
    return response

@router.put("/updateEmpContactByID/{id}")
def updateEmpContactByID(id: int, contact: EmpContactUpdateSchema, db: Session = Depends(connectDB.connectDB)):
    data = EmpContactServices(db).updateEmpContactByID(id, contact)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Update Employee Contact !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Updated Employee Contact !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response

@router.delete("/deleteEmpContactByID/{id}")
def deleteEmpContactByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = EmpContactServices(db).deleteEmpContactByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Delete Employee Contact !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Deleted Employee Contact !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response
