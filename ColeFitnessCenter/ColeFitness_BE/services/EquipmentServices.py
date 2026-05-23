from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.Equipment import Equipment
from schemas.EquipmentSchema import EquipmentSchema, EquipmentUpdateSchema


class EquipmentServices:
    def __init__(self, db: Session):
        self.db = db

    def getAllEquipment(self) -> (list[Equipment] | None):
        try:
            allEquipment = self.db.query(Equipment).all()
            if not allEquipment:
                logger.error("getAllEquipment: No Equipment Found In Table !")
                return
            logger.info("getAllEquipment: Successfully Get All Equipment !")
            self.db.close()
            return allEquipment
        except Exception as ex:
            logger.error(f"getAllEquipment: {ex} !")
            return

    def getEquipmentByID(self, id: int) -> (Equipment | None):
        try:
            equipmentByID = self.db.query(Equipment).filter(Equipment.EquipmentID == id).first()
            if not equipmentByID:
                logger.error("getEquipmentByID: Equipment Not Found !")
                return
            logger.info("getEquipmentByID: Successfully Get Equipment By ID !")
            self.db.close()
            return equipmentByID
        except Exception as ex:
            logger.error(f"getEquipmentByID: {ex} !")
            return

    def createEquipment(self, equipment: EquipmentSchema) -> (Equipment | None):
        try:
            lastEquipment = self.db.query(func.max(Equipment.EquipmentID)).first()
            if not all(lastEquipment):
                logger.error("createEquipment: No Equipment Found In Table !")
                newEquipmentID = 1
            else:
                newEquipmentID = lastEquipment[0] + 1
            newEquipment = Equipment(EquipmentID=newEquipmentID, **dict(equipment))
            if not newEquipment:
                logger.error("createEquipment: Error During Creating New Equipment !")
                return
            self.db.add(newEquipment)
            self.db.commit()
            self.db.close()
            logger.info("createEquipment: Successfully Create New Equipment !")
            return newEquipment
        except Exception as ex:
            logger.error(f"createEquipment: {ex} !")
            return
    
    def updateEquipmentByID(self, id: int, equipment: EquipmentUpdateSchema) -> (Equipment | None):
        try:
            equipmentByID = self.db.query(Equipment).filter(Equipment.EquipmentID == id).first()
            if not equipmentByID:
                logger.error("updateEquipmentByID: Equipment Not Found !")
                return
            equipmentByID = equipmentByID.__dict__
            updateEquipment = {}
            for attribute in equipment:
                columnName = attribute[0]
                if attribute[1] == None:
                    updateEquipment[columnName] = equipmentByID[columnName]
                else:
                    updateEquipment[columnName] = attribute[1]
            self.db.query(Equipment).filter(Equipment.EquipmentID == id).update(updateEquipment)
            self.db.commit()
            self.db.close()
            logger.info("updateEquipmentByID: Successfully Update Equipment !")
            return equipmentByID
        except Exception as ex:
            logger.error(f"updateEquipmentByID: {ex} !")
            return

    def deleteEquipmentByID(self, id: int) -> (Equipment | None):
        try:
            equipmentByID = self.db.query(Equipment).filter(Equipment.EquipmentID == id).first()
            if not equipmentByID:
                logger.error("deleteEquipmentByID: Equipment Not Found !")
                return
            self.db.delete(equipmentByID)
            self.db.commit()
            self.db.close()
            logger.info("deleteEquipmentByID: Successfully Delete Equipment !")
            return equipmentByID
        except Exception as ex:
            logger.error(f"deleteEquipmentByID: {ex} !")
            return