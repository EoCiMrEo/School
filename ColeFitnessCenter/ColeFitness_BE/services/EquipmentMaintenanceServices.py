from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.EquipmentMaintenance import EquipmentMaintenance
from schemas.EquipmentMaintenanceSchema import EquipmentMaintenanceSchema, EquipmentMaintenanceUpdateSchema


class EquipmentMaintenanceServices:
    def __init__(self, db: Session):
        self.db = db

    def getAllEquipmentMaintenance(self):
        try:
            allEquipmentMaintenance = self.db.query(EquipmentMaintenance).all()
            if not allEquipmentMaintenance:
                logger.info("No equipment maintenance found")
                return
            logger.info("Successfully found all equipment maintenance")
            self.db.close()
            return allEquipmentMaintenance
        except Exception as ex:
            logger.error(f"getAllEquipmentMaintenance: {ex} !")
            return

    def getEquipmentMaintenanceByID(self, id: int):
        try:
            equipmentMaintenanceByID = self.db.query(EquipmentMaintenance).filter(EquipmentMaintenance.EquipmentMaintenanceID == id).first()
            if not equipmentMaintenanceByID:
                logger.error("getEquipmentMaintenanceByID: EquipmentMaintenance Not Found !")
                return
            logger.info("getEquipmentMaintenanceByID: Successfully Get EquipmentMaintenance By ID !")
            self.db.close()
            return equipmentMaintenanceByID
        except Exception as ex:
            logger.error(f"getEquipmentMaintenanceByID: {ex} !")
            return

    def createEquipmentMaintenance(self, equipmentMaintenance: EquipmentMaintenanceSchema):
        try:
            lastEquipmentMaintenance = self.db.query(func.max(EquipmentMaintenance.EquipmentMaintenanceID)).first()
            if not all(lastEquipmentMaintenance):
                logger.error("createEquipmentMaintenance: No EquipmentMaintenance Found In Table !")
                newEquipmentMaintenanceID = 1
            else:
                newEquipmentMaintenanceID = lastEquipmentMaintenance[0] + 1
            newEquipmentMaintenance = EquipmentMaintenance(EquipmentMaintenanceID=newEquipmentMaintenanceID, **dict(equipmentMaintenance))
            if not newEquipmentMaintenance:
                logger.error("createEquipmentMaintenance: Error During Creating New EquipmentMaintenance !")
                return
            self.db.add(newEquipmentMaintenance)
            self.db.commit()
            self.db.close()
            logger.info("createEquipmentMaintenance: Successfully Create New EquipmentMaintenance !")
            return newEquipmentMaintenance
        except Exception as ex:
            logger.error(f"createEquipmentMaintenance: {ex} !")
            return
    
    def updateEquipmentMaintenanceByID(self, id: int, equipmentMaintenance: EquipmentMaintenanceUpdateSchema):
        try:
            equipmentMaintenanceByID = self.db.query(EquipmentMaintenance).filter(EquipmentMaintenance.EquipmentMaintenanceID == id).first()
            if not equipmentMaintenanceByID:
                logger.error("updateEquipmentMaintenanceByID: EquipmentMaintenance Not Found !")
                return
            for key, value in dict(equipmentMaintenance).items():
                setattr(equipmentMaintenanceByID, key, value)
            self.db.commit()
            self.db.close()
            logger.info("updateEquipmentMaintenanceByID: Successfully Update EquipmentMaintenance !")
            return equipmentMaintenanceByID
        except Exception as ex:
            logger.error(f"updateEquipmentMaintenanceByID: {ex} !")
            return
    
    def deleteEquipmentMaintenanceByID(self, id: int):
        try:
            equipmentMaintenanceByID = self.db.query(EquipmentMaintenance).filter(EquipmentMaintenance.EquipmentMaintenanceID == id).first()
            if not equipmentMaintenanceByID:
                logger.error("deleteEquipmentMaintenanceByID: EquipmentMaintenance Not Found !")
                return
            self.db.delete(equipmentMaintenanceByID)
            self.db.commit()
            self.db.close()
            logger.info("deleteEquipmentMaintenanceByID: Successfully Delete EquipmentMaintenance !")
            return
        except Exception as ex:
            logger.error(f"deleteEquipmentMaintenanceByID: {ex} !")
            return