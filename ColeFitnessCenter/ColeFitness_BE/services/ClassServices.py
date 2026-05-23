from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.Class import Class
from schemas.ClassSchema import ClassSchema, ClassUpdateSchema

class ClassServices:
    def __init__(self, db: Session):
        self.db = db

    def getAllClass(self):
        try:
            allClasses = self.db.query(Class).all()
            if not allClasses:
                logger.error("getAllClass: No Class Found !")
                return
            logger.info("getAllClass: Successfully Get All Class !")
            self.db.close()
            return allClasses
        except Exception as ex:
            logger.error(f"getAllClass: {ex} !")
            return
    
    def getClassByID(self, id: int):
        try:
            classByID = self.db.query(Class).filter(Class.ClassID == id).first()
            if not classByID:
                logger.error("getClassByID: Class Not Found !")
                return
            logger.info("getClassByID: Successfully Get Class By ID !")
            self.db.close()
            return classByID
        except Exception as ex:
            logger.error(f"getClassByID: {ex} !")
            return
        
    def createClass(self, classSchema: ClassSchema):
        try:
            lastClassID = self.db.query(func.max(Class.ClassID)).first()
            if not all(lastClassID):
                logger.error("createClass: No Class Found In Table !")
                newClassID = 1
            else:
                newClassID = lastClassID[0] + 1
            newClass = Class(ClassID=newClassID, **dict(classSchema))
            if not newClass:
                logger.error("createClass: Error During Creating New Class !")
                return
            self.db.add(newClass)
            self.db.commit()
            self.db.close()
            logger.info("createClass: Successfully Create New Class !")
            return newClass
        except Exception as ex:
            logger.error(f"createClass: {ex} !")
            return
        
    def updateClassByID(self, id: int, classSchema: ClassUpdateSchema):
        try:
            classByID = self.db.query(Class).filter(Class.ClassID == id).first()
            if not classByID:
                logger.error("updateClassByID: Class Not Found !")
                return
            classByID = classByID.__dict__
            updateClass = {}
            for attribute in classSchema:
                columnName = attribute[0]
                if attribute[1] == None:
                    updateClass[columnName] = classByID[columnName]
                else:
                    updateClass[columnName] = attribute[1]
            self.db.query(Class).filter(Class.ClassID == id).update(updateClass)
            self.db.commit()
            self.db.close()
            logger.info("updateClassByID: Successfully Update Class !")
            return classByID
        except Exception as ex:
            logger.error(f"updateClassByID: {ex} !")
            return
        
    def deleteClassByID(self, id: int):
        try:
            classByID = self.db.query(Class).filter(Class.ClassID == id).first()
            if not classByID:
                logger.error("deleteClassByID: Class Not Found !")
                return
            self.db.delete(classByID)
            self.db.commit()
            self.db.close()
            logger.info("deleteClassByID: Successfully Delete Class !")
            return classByID
        except Exception as ex:
            logger.error(f"deleteClassByID: {ex} !")
            return