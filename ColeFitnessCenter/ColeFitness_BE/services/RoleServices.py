from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.Role import Role
from schemas.RoleSchema import RoleSchema, RoleUpdateSchema

class RoleServices:
    def __init__(self, db: Session):
        self.db = db

    def getAllRole(self) -> (list[Role] | None):
        try:
            allRoles = self.db.query(Role).all()
            if not allRoles:
                logger.error("getAllRole: No Role Found In Table !")
                return
            logger.info("getAllRole: Successfully Get All Role !")
            self.db.close()
            return allRoles
        except Exception as ex:
            logger.error(f"getAllRole: {ex} !")
            return
    
    def getRoleByID(self, id: int) -> (Role | None):
        try:
            roleByID = self.db.query(Role).filter(Role.RoleID == id).first()
            if not roleByID:
                logger.error("getRoleByID: Role Not Found !")
                return
            logger.info("getRoleByID: Successfully Get Role By ID !")
            self.db.close()
            return roleByID
        except Exception as ex:
            logger.error(f"getRoleByID: {ex} !")
            return
    
    def createRole(self, role: RoleSchema) -> (Role | None):
        try:
            lastRole = self.db.query(func.max(Role.RoleID)).first()
            if not all(lastRole):
                logger.error("createRole: No Role Found In Table !")
                newRoleID = 1
            else:
                newRoleID = lastRole[0] + 1
            newRole = Role(RoleID=newRoleID, **dict(role))
            if not newRole:
                logger.error("createRole: Error During Creating New Role !")
                return
            self.db.add(newRole)
            self.db.commit()
            self.db.close()
            logger.info("createRole: Successfully Creat New Role !")
            return newRole
        except Exception as ex:
            logger.error(f"createRole: {ex} !")
            return
    
    def updateRoleByID(self, id: int, roleSchema: RoleUpdateSchema) -> (Role | None):
        try:
            roleByID = self.db.query(Role).filter(Role.RoleID == id).first()
            if not roleByID:
                logger.error("updateRoleByID: Role Not Found !")
                return
            roleByID.RoleName = roleSchema.RoleName
            self.db.commit()
            self.db.close()
            logger.info("updateRoleByID: Successfully Update Role By ID !")
            return roleByID
        except Exception as ex:
            logger.error(f"updateRoleByID: {ex} !")
            return
    
    def deleteRoleByID(self, id: int) -> (Role | None):
        try:
            roleByID = self.db.query(Role).filter(Role.RoleID == id).first()
            if not roleByID:
                logger.error("deleteRoleByID: Role Not Found !")
                return
            self.db.delete(roleByID)
            self.db.commit()
            self.db.close()
            logger.info("deleteRoleByID: Successfully Delete Role !")
            return roleByID
        except Exception as ex:
            logger.error(f"deleteRoleByID: {ex} !")
            return
        