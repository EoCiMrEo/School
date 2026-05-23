from sqlalchemy.orm import Session
from sqlalchemy import func
from db.models.EmpAccount import EmpAccount
from schemas.EmpAccountSchema import EmpAccountSchema, EmpAccountPasswordUpdateSchema
from werkzeug.security import generate_password_hash, check_password_hash
from db.connectDB import logger

class EmpAccountServices:
    def __init__(self, db: Session):
        self.db = db

    def createEmpAccount(self, account: EmpAccountSchema) -> (EmpAccount | None):
        try:
            lastEmpAccount = self.db.query(func.max(EmpAccount.EmpAccountID)).first()
            if not all(lastEmpAccount):
                logger.error("createEmpAccount: No Account Found In Table !")
                newEmpAccountID = 1
            else:
                newEmpAccountID = lastEmpAccount[0] + 1
            if not account.Password:
                logger.error("createEmpAccount: No Password Provided !")
                return
            password_hash = self.hashPassword(account.Password)
            check_password = self.checkPassword(account.Password, password_hash)
            if not check_password:
                logger.error("createEmpAccount: Hash password error !")
                return
            account.Password = password_hash
            newAccount = EmpAccount(EmpAccountID=newEmpAccountID,**dict(account))
            if not newAccount:
                logger.error("createEmpAccount: Error Ceating New Employee Account !")
                return
            self.db.add(newAccount)
            self.db.commit()
            self.db.close()
            logger.info("createEmpAccount: Successfully created account")
            return newAccount
        except Exception as ex:
            logger.error(f"createEmpAccount: {ex}")
            return

    def getAllEmpAccount(self) -> (list[EmpAccount] | None):
        try:
            allEmpAccounts = self.db.query(EmpAccount).all()
            if not allEmpAccounts:
                logger.error("getAllEmpAccount: No account found")
                return
            logger.info("getAllEmpAccount: Successfully Get All Accounts")
            self.db.close()
            return allEmpAccounts
        except Exception as ex:
            logger.error(f"getAllEmpAccount: {ex} !")
            return ex

    def getAccountByEmpID(self, id: int) -> (EmpAccount | None):
        try:
            accountByEmpID = self.db.query(EmpAccount).filter(EmpAccount.EmployeeID == id).first()
            if not accountByEmpID:
                logger.error("getAccountByEmpID: Not Found Account With This Employee ID")
                return
            logger.info("getAccountByEmpID: Successfully Get Account By ID")
            self.db.close()
            return accountByEmpID
        except Exception as ex:
            logger.error(f"getAccountByEmpID: {ex} !")
            return ex

    def updateEmpAccountPasswordByID(self, id: int, password: EmpAccountPasswordUpdateSchema) -> (EmpAccount | None):
        try:
            empAccountByID = self.db.query(EmpAccount).filter(EmpAccount.EmpAccountID == id).first()
            if not empAccountByID:
                logger.error("updatePasswordByID: Employee's Account Not Found")
                return
            if not password:
                logger.error("updatePasswordByID: No Password Provided")
                return
            new_password = self.hashPassword(password.Password)
            check_password = self.checkPassword(password.Password, new_password)
            if not check_password:
                logger.error("updatePasswordByID: Update password failed, Hash password error")
                return
            empAccountByID.Password = new_password
            self.db.commit()
            self.db.close()
            logger.info("updatePasswordByID: Successfully Updated Password")
            return empAccountByID
        except Exception as ex:
            logger.error(f"updatePasswordByID: {ex}")
            return
        
    def deleteEmpAccountByID(self, id: int) -> (EmpAccount | None):
        try:
            accountByID = self.db.query(EmpAccount).filter(EmpAccount.EmpAccountID == id).first()
            if not accountByID:
                logger.error("deleteAccountByID: Not Found Account With This ID")
                return
            self.db.delete(accountByID)
            self.db.commit()
            self.db.close()
            logger.info("deleteAccountByID: Successfully Deleted Account")
            return accountByID
        except Exception as ex:
            logger.error(f"deleteAccountByID: {ex} !")
            return
     
    @staticmethod
    def hashPassword(password: str) -> str:
        return generate_password_hash(password)
    
    @staticmethod
    def checkPassword(password: str, hashedPassword: str) -> bool:
        return check_password_hash(hashedPassword, password)