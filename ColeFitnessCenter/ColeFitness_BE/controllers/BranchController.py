from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db import connectDB
from schemas.BranchSchema import BranchSchema, BranchUpdateSchema
from services.BranchServices import BranchServices

router = APIRouter(prefix="/branch", tags=["branch"])


@router.post("/createBranch")
def createBranch(branch: BranchSchema, db: Session = Depends(connectDB.connectDB)):
    data = BranchServices(db).createBranch(branch)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Create Branch !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Create Branch !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_201_CREATED)
    return response

@router.get("/getAllBranch")
def getAllBranch(db: Session = Depends(connectDB.connectDB)):
    data = BranchServices(db).getAllBranch()
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get All Branch !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get All Branch !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.get("/getBranchByID/{id}")
def getBranchByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = BranchServices(db).getBranchByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Branch Not Found With This ID !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get Branch By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.put("/updateBranchByID/{id}")
def updateBranch(id: int, branch: BranchUpdateSchema, db: Session = Depends(connectDB.connectDB)):
    data = BranchServices(db).updateBranchByID(id, branch)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Update Branch !"})
    responseConfig = {
        "data": data,
        "status": 202,
        "message": "Successfully Updated Branch !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response

@router.delete("/deleteBranchByID/{id}")
def deleteBranchByID(id: int, db: Session = Depends(connectDB.connectDB)):
    data = BranchServices(db).deleteBranchByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Delete Branch !"})
    responseConfig = {
        "data": data,
        "status": 202,
        "message": "Successfully Deleted Branch !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response