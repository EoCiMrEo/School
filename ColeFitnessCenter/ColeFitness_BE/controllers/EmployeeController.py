from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db import connectDB
from schemas.EmployeeSchema import EmployeeSchema, EmployeeUpdateSchema
from services.EmployeeServices import EmployeeServices

router = APIRouter(prefix="/employee", tags=["employee"])

@router.get("/getAllEmployee")
def getAllEmployee(db: Session = Depends(connectDB.connectDB)) -> JSONResponse:
    data = EmployeeServices(db).getAllEmployee()
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get All Employee !"})
    reponseConfig = {
        "data": data,
        "message": "Successfully Get All Employees !"
    }
    response = JSONResponse(content=jsonable_encoder(reponseConfig), status_code= status.HTTP_200_OK)
    return response

@router.get("/getEmployeeByID/{id}")
def getEmployeeByID(id: int, db: Session = Depends(connectDB.connectDB)) -> JSONResponse:
    data = EmployeeServices(db).getEmployeeByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get Employee With This ID !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get Employee By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.post("/createEmployee")
def createEmployee(Employee: EmployeeSchema, db: Session = Depends(connectDB.connectDB)) -> JSONResponse:
    data = EmployeeServices(db).createEmployee(Employee)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Creat New Employee !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Created New Employee !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_201_CREATED)
    return response

@router.put("/updateEmployeeByID/{id}")
def updateEmployee(id: int, Employee: EmployeeUpdateSchema, db: Session = Depends(connectDB.connectDB)) -> JSONResponse:
    data = EmployeeServices(db).updateEmployeeByID(id, Employee)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Update Employee !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Updated Employee !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response

@router.delete("/deleteEmployeeByID/{id}")
def deleteEmployeeByID(id: int, db: Session = Depends(connectDB.connectDB)) -> JSONResponse:
    data = EmployeeServices(db).deleteEmployeeByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Delete Employee !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Deleted Employee !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response