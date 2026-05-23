from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db import connectDB
from schemas.ColeFitnessSchema import ColeFitnessLoginSchema
from services.ColeFitnessServices import ColeFitnessServices

router = APIRouter(prefix="/colefitness", tags=["colefitness"])

@router.post("/login/{type}")
def login(type: str, account: ColeFitnessLoginSchema, db: Session = Depends(connectDB.connectDB)):
    data = ColeFitnessServices(db).login(type, account)
    if not data:
        raise HTTPException(status_code=404, detail={"data": [], "message": "Unable To Login !"})
    responseConfig = {
        "data": data,
        "status": 202,
        "message": "Successfully Login !"
    }
    response = JSONResponse(content=jsonable_encoder(responseConfig), status_code=status.HTTP_202_ACCEPTED)
    return response