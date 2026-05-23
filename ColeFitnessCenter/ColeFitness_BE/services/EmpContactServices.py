from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.EmpContact import EmpContact
from schemas.EmpContactSchema import EmpContactSchema, EmpContactUpdateSchema

class EmpContactServices:
    def __init__(self, db: Session):
        self.db = db
    
    def getAllEmpContact(self) -> (EmpContact | None):
        try:
            allContacts = self.db.query(EmpContact).all()
            if not allContacts:
                logger.error("getAllContact: No Contact Found !")
                return
            logger.info("getAllContact: Successfully Get All Contact !")
            self.db.close()
            return allContacts
        except Exception as e:
            logger.error(f"getAllContact: {e} !")
            return
    
    def getContactByEmpID(self, id: int) -> (list[EmpContact] | None):
        try:
            contactByEmpID = self.db.query(EmpContact).filter(EmpContact.EmployeeID == id).all()
            if not contactByEmpID:
                logger.error("getContactByEmpID: No Contact Found !")
                return
            logger.info("getContactByEmpID: Successfully Get Contact By ID !")
            self.db.close()
            return contactByEmpID
        except Exception as ex:
            logger.error(f"getContactByEmpID: {ex} !")
            return
    
    def createEmpContact(self, contact: EmpContactSchema) -> (EmpContact | None):
        try:
            lastContact = self.db.query(func.max(EmpContact.EmpContactID)).first()
            if not all(lastContact):
                logger.info("createContact: No Contact Found In Table !")
                newContactID = 1
            else:
                newContactID = lastContact[0] + 1
            newContact = EmpContact(EmpContactID=newContactID, **dict(contact))
            if not newContact:
                logger.error("createContact: Error During Creating New Contact !")
                return
            self.db.add(newContact)
            self.db.commit()
            self.db.close()
            logger.info("createContact: Successfully Creat New Contact !")
            return newContact
        except Exception as ex:
            logger.error(f"createContact: {ex} !")
            return

    def updateEmpContactByID(self, id: int, contact: EmpContactUpdateSchema) -> (EmpContact | None):
        try:
            contactByID = self.db.query(EmpContact).filter(EmpContact.EmpContactID == id).first()
            if not contactByID:
                logger.error("updateContactByID: No Contact Found !")
                return
            contactByID = contactByID.__dict__
            updateContact = {}
            for attribute in contact:
                columnName = attribute[0]
                if attribute[1] == None:
                    updateContact[columnName] = contactByID[columnName]
                else:
                    updateContact[columnName] = attribute[1]
            self.db.query(EmpContact).filter(EmpContact.EmpContactID == id).update(updateContact)
            self.db.commit()
            self.db.close()
            logger.info("updateContactByID: Successfully Update Contact !")
            return contactByID
        except Exception as ex:
            logger.error(f"updateContactByID: {ex} !")
            return

    def deleteEmpContactByID(self, id: int) -> (EmpContact | None):
        try:
            contactByID = self.db.query(EmpContact).filter(EmpContact.EmpContactID == id).first()
            if not contactByID:
                logger.error("deleteContactByID: No Contact Found !")
                return
            self.db.delete(contactByID)
            self.db.commit()
            self.db.close()
            logger.info("deleteContactByID: Successfully Delete Contact !")
            return contactByID
        except Exception as ex:
            logger.error(f"deleteContactByID: {ex} !")
            return