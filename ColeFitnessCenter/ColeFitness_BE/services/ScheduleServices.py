from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.Schedule import Schedule
from schemas.ScheduleSchema import ScheduleSchema, ScheduleUpdateSchema

class ScheduleServices:
    def __init__(self, db: Session):
        self.db = db

    def getAllSchedule(self) -> (list[Schedule] | None):
        try:
            allSchedule = self.db.query(Schedule).all()
            if not allSchedule:
                logger.error("getAllSchedule: No Schedule Found !")
                return
            self.db.close()
            logger.info("getAllSchedule: Successfully Get All Schedule !")
            return allSchedule
        except Exception as ex:
            logger.error(f"getAllSchedule: {ex} !")
            return

    def getScheduleByID(self, id: int) -> (Schedule | None):
        try:
            schedule = self.db.query(Schedule).filter(Schedule.ScheduleID == id).first()
            if not schedule:
                logger.error("getScheduleByID: No Schedule Found !")
                return
            self.db.close()
            logger.info("getScheduleByID: Successfully Get Schedule By ID !")
            return schedule
        except Exception as ex:
            logger.error(f"getScheduleByID: {ex} !")
            return
    
    def createSchedule(self, schedule: ScheduleSchema) -> (Schedule | None):
        try:
            lastSchedule = self.db.query(func.max(Schedule.ScheduleID)).first()
            if not all(lastSchedule):
                logger.error("createSchedule: No Schedule Found In Table !")
                newScheduleID = 1
            else:
                newScheduleID = lastSchedule[0] + 1
            newSchedule = Schedule(ScheduleID=newScheduleID, **dict(schedule))
            if not newSchedule:
                logger.error("createSchedule: Error During Creating New Schedule !")
                return
            self.db.add(newSchedule)
            self.db.commit()
            self.db.close()
            logger.info("createSchedule: Successfully Creat New Schedule !")
            return newSchedule
        except Exception as ex:
            logger.error(f"createSchedule: {ex} !")
            return

    def updateScheduleByID(self, id: int, schedule: ScheduleUpdateSchema) -> (Schedule | None):
        try:
            updateSchedule = self.db.query(Schedule).filter(Schedule.ScheduleID == id).first()
            if not updateSchedule:
                logger.error("updateSchedule: No Schedule Found !")
                return
            updateSchedule.DateTime = schedule.DateTime
            updateSchedule.RoomID = schedule.RoomID
            self.db.commit()
            self.db.close()
            logger.info("updateSchedule: Successfully Update Schedule !")
            return updateSchedule
        except Exception as ex:
            logger.error(f"updateSchedule: {ex} !")
            return

    def deleteScheduleByID(self, id: int) -> (Schedule | None):
        try:
            deleteSchedule = self.db.query(Schedule).filter(Schedule.ScheduleID == id).first()
            if not deleteSchedule:
                logger.error("deleteSchedule: No Schedule Found !")
                return
            self.db.delete(deleteSchedule)
            self.db.commit()
            self.db.close()
            logger.info("deleteSchedule: Successfully Delete Schedule !")
            return deleteSchedule
        except Exception as ex:
            logger.error(f"deleteSchedule: {ex} !")
            return