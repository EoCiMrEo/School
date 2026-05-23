from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.Room import Room
from schemas.RoomSchema import RoomSchema, RoomUpdateSchema


class RoomServices:
    def __init__(self, db: Session):
        self.db = db
    
    def getAllRoom(self) -> (list[Room] | None):
        try:
            allRooms = self.db.query(Room).all()
            if not allRooms:
                logger.error("getAllRoom: No Room Found In Table !")
                return
            logger.info("getAllRoom: Successfully Get All Room !")
            self.db.close()
            return allRooms
        except Exception as ex:
            logger.error(f"getAllRoom: {ex} !")
            return
    
    def getRoomByID(self, id: int) -> (Room | None):
        try:
            roomByID = self.db.query(Room).filter(Room.RoomID == id).first()
            if not roomByID:
                logger.error("getRoomByID: Room Not Found !")
                return
            logger.info("getRoomByID: Successfully Get Room By ID !")
            self.db.close()
            return roomByID
        except Exception as ex:
            logger.error(f"getRoomByID: {ex} !")
            return
    
    def createRoom(self, room: RoomSchema) -> (Room | None):
        try:
            lastRoom = self.db.query(func.max(Room.RoomID)).first()
            if not all(lastRoom):
                logger.error("createRoom: No Room Found In Table !")
                newRoomID = 1
            else:
                newRoomID = lastRoom[0] + 1
            newRoom = Room(RoomID=newRoomID, **dict(room))
            if not newRoom:
                logger.error("createRoom: Error During Creating New Room !")
                return
            self.db.add(newRoom)
            self.db.commit()
            self.db.close()
            logger.info("createRoom: Successfully Creat New Room !")
            return newRoom
        except Exception as ex:
            logger.error(f"createRoom: {ex} !")
            return
    
    def updateRoomByID(self, id: int, room: RoomUpdateSchema) -> (Room | None):
        try:
            roomByID = self.db.query(Room).filter(Room.RoomID == id).first()
            if not roomByID:
                logger.error("updateRoomByID: Room Not Found !")
                return
            roomByID = roomByID.__dict__
            updateRoom = {}
            for attribute in room:
                columnName = attribute[0]
                if attribute[1] == None:
                    updateRoom[columnName] = roomByID[columnName]
                else:
                    updateRoom[columnName] = attribute[1]
            self.db.query(Room).filter(Room.RoomID == id).update(updateRoom)
            self.db.commit()
            self.db.close()
            logger.info("updateRoomByID: Successfully Update Room !")
            return roomByID
        except Exception as ex:
            logger.error(f"updateRoomByID: {ex} !")
            return
    
    def deleteRoomByID(self, id: int) -> (Room | None):
        try:
            roomByID = self.db.query(Room).filter(Room.RoomID == id).first()
            if not roomByID:
                logger.error("deleteRoomByID: Room Not Found !")
                return
            self.db.delete(roomByID)
            self.db.commit()
            self.db.close()
            logger.info("deleteRoomByID: Successfully Delete Room !")
            return roomByID
        except Exception as ex:
            logger.error(f"deleteRoomByID: {ex} !")
            return