from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db import connectDB
from schemas.MembershipSchema import MembershipSchema, MembershipUpdateSchema
from services.MembershipServices import MembershipServices

router = APIRouter(prefix="/member", tags=["membership"])

@router.get("/getAllMembership")
def getAllMembership(db: Session = Depends(connectDB.connectDB)) -> JSONResponse:
    data = MembershipServices(db).getAllMembership()
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get All Membership !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get All Membership !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.get("/getMembershipByID/{id}")
def getMembershipByID(id: int, db: Session = Depends(connectDB.connectDB)) -> JSONResponse:
    data = MembershipServices(db).getMembershipByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Get Membership With This ID !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Get Membership By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_200_OK)
    return response

@router.post("/createMembership")
def createMembership(membership: MembershipSchema, db: Session = Depends(connectDB.connectDB)) -> JSONResponse:
    data = MembershipServices(db).createMembership(membership)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Create Membership !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Create Membership !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_201_CREATED)
    return response

@router.put("/updateMembershipByID/{id}")
def updateMembershipByID(id: int, membership: MembershipUpdateSchema, db: Session = Depends(connectDB.connectDB)) -> JSONResponse:
    data = MembershipServices(db).updateMembershipByID(id, membership)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Update Membership !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Update Membership By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response

@router.delete("/deleteMembershipByID/{id}")
def deleteMembershipByID(id: int, db: Session = Depends(connectDB.connectDB)) -> JSONResponse:
    data = MembershipServices(db).deleteMembershipByID(id)
    if not data:
        raise HTTPException(status_code=200, detail={"data": [], "message": "Unable To Delete Membership !"})
    responseConfig = {
        "data": data,
        "message": "Successfully Deleted Membership By ID !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response