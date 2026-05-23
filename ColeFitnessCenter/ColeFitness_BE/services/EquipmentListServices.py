from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.EquipmentList import EquipmentList
from schemas.EquipmentListSchema import EquipmentListSchema, EquipmentListUpdateSchema


class EquipmentListServices:
    def __init__(self, db: Session):
        self.db = db

    def getAllEquipmentList(self) -> (list[EquipmentList] | None):
        try:
            equipmentList = self.db.query(EquipmentList).all()
            if not equipmentList:
                logger.error("getAllEquipmentList: No EquipmentList Found In Table !")
                return
            logger.info("getAllEquipmentList: Successfully Get All EquipmentList !")
            self.db.close()
            return equipmentList
        except Exception as ex:
            logger.error(f"getAllEquipmentList: {ex} !")
            return
    
    def getEquipmentListByID(self, id: int) -> (EquipmentList | None):
        try:
            equipmentListByID = self.db.query(EquipmentList).filter(EquipmentList.EquipmentListID == id).first()
            if not equipmentListByID:
                logger.error("getEquipmentListByID: EquipmentList Not Found !")
                return
            logger.info("getEquipmentListByID: Successfully Get EquipmentList By ID !")
            self.db.close()
            return equipmentListByID
        except Exception as ex:
            logger.error(f"getEquipmentListByID: {ex} !")
            return

    def createEquipmentList(self, equipmentList: EquipmentListSchema) -> (EquipmentList | None):
        try:
            lastEquipmentList = self.db.query(func.max(EquipmentList.EquipmentListID)).first()
            if not all(lastEquipmentList):
                logger.error("createEquipmentList: No EquipmentList Found In Table !")
                newEquipmentListID = 1
            else:
                newEquipmentListID = lastEquipmentList[0] + 1
            newEquipmentList = EquipmentList(EquipmentListID=newEquipmentListID, **dict(equipmentList))
            if not newEquipmentList:
                logger.error("createEquipmentList: Error During Creating New EquipmentList !")
                return
            self.db.add(newEquipmentList)
            self.db.commit()
            self.db.close()
            logger.info("createEquipmentList: Successfully Create New EquipmentList !")
            return newEquipmentList
        except Exception as ex:
            logger.error(f"createEquipmentList: {ex} !")
            return
    
    def updateEquipmentListByID(self, id: int, equipmentList: EquipmentListUpdateSchema) -> (EquipmentList | None):
        try:
            equipmentListByID = self.db.query(EquipmentList).filter(EquipmentList.EquipmentListID == id).first()
            if not equipmentListByID:
                logger.error("updateEquipmentListByID: EquipmentList Not Found !")
                return
            equipmentListByID = equipmentListByID.__dict__
            updateEquipmentList = {}
            for attribute in equipmentList:
                columnName = attribute[0]
                if attribute[1] == None:
                    updateEquipmentList[columnName] = equipmentListByID[columnName]
                else:
                    updateEquipmentList[columnName] = attribute[1]
            self.db.query(EquipmentList).filter(EquipmentList.EquipmentListID == id).update(updateEquipmentList)
            self.db.commit()
            self.db.close()
            logger.info("updateEquipmentListByID: Successfully Update EquipmentList !")
            return equipmentListByID
        except Exception as ex:
            logger.error(f"updateEquipmentListByID: {ex} !")
            return
    
    def deleteEquipmentListByID(self, id: int) -> (EquipmentList | None):
        try:
            equipmentListByID = self.db.query(EquipmentList).filter(EquipmentList.EquipmentListID == id).first()
            if not equipmentListByID:
                logger.error("deleteEquipmentListByID: EquipmentList Not Found !")
                return
            self.db.delete(equipmentListByID)
            self.db.commit()
            self.db.close()
            logger.info("deleteEquipmentListByID: Successfully Delete EquipmentList !")
            return equipmentListByID
        except Exception as ex:
            logger.error(f"deleteEquipmentListByID: {ex} !")
            return