from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db import connectDB
from schemas.ClassSchema import ClassSchema, ClassUpdateSchema
from services.ClassServices import ClassServices

router = APIRouter(prefix="/class", tags=["class"])


@router.get("/getAllClass")
def getAllClass(db: Session = Depends(connectDB.connectDB)):
    data = ClassServices(db).getAllClass()
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get All Class !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get All Class !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.get("/getClassByID/{id}")
def getClassByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = ClassServices(db).getClassByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get Class With This ID !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get Class By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.post("/createClass")
def createClass(classSchema: ClassSchema, db: Session = Depends(connectDB.connectDB)):
    data = ClassServices(db).createClass(classSchema)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Create Class !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Create Class !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_201_CREATED)
    return response

@router.put("/updateClassByID/{id}")
def updateClassByID(id: int, classSchema: ClassUpdateSchema, db: Session = Depends(connectDB.connectDB)):
    data = ClassServices(db).updateClassByID(id, classSchema)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Update Class !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Update Class By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response

@router.delete("/deleteClassByID/{id}")
def deleteClassByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = ClassServices(db).deleteClassByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Delete Class !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Deleted Class By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response
    