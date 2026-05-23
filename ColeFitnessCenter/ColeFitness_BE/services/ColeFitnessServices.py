from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.EmpAccount import EmpAccount
from db.models.MemAccount import MemAccount
from db.models.Employee import Employee
from db.models.Member import Member
from schemas.ColeFitnessSchema import ColeFitnessLoginSchema
from werkzeug.security import generate_password_hash, check_password_hash
from utils import ColeFitnessJWT
import json

class ColeFitnessServices:
    def __init__(self, db: Session):
        self.db = db
    
    def login(self, type: str, account: ColeFitnessLoginSchema) -> (EmpAccount | MemAccount | None):
        try:
            if type.title() == "Employee":
                data = self.db.query(EmpAccount).filter(EmpAccount.UserName == account.UserName).first()
                if not data:
                    logger.error("login: No Account Found !")
                    return
                check_password = check_password_hash(data.Password, account.Password)
                if not check_password:
                    logger.error("login: Invalid Password !")
                    return
                logger.info("login: Successfully Login !")
                employee = self.db.query(Employee).filter(Employee.EmployeeID == data.EmployeeID).first()
                if not employee:
                    logger.error("login: No Employee Found !")
                    return
                accessTokenData = {
                    "UserName": data.UserName,
                    "Password": data.Password,
                    "EmployeeID": data.EmployeeID
                }
                response = {
                    "data": employee,
                    "token": ColeFitnessJWT.createAccessToken(accessTokenData)
                }
                return response
            elif type.title() == "Member":
                data = self.db.query(MemAccount).filter(MemAccount.UserName == account.UserName).first()
                if not data:
                    logger.error("login: No Account Found !")
                    return
                check_password = check_password_hash(data.Password, account.Password)
                if not check_password:
                    logger.error("login: Invalid Password !")
                    return
                logger.info("login: Successfully Login !")
                member = self.db.query(Member).filter(Member.MemberID == data.MemberID).first()
                if not member:
                    logger.error("login: No Member Found !")
                    return
                accessTokenData = {
                    "UserName": data.UserName,
                    "Password": data.Password,
                    "MemberID": data.MemberID
                }
                response = {
                    "data": member,
                    "token": ColeFitnessJWT.createAccessToken(accessTokenData)
                }
                return response
            else:
                logger.error("login: Invalid Type !")
                return
        except Exception as ex:
            logger.error(f"login: {ex} !")
            return
        
    