from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.Member import Member
from schemas.MemberSchema import MemberSchema, MemberUpdateSchema
class MemberServices:
    def __init__(self, db: Session) -> None:
        self.db = db
    
    def createMember(self, member: MemberSchema) -> (Member | None):
        try:
            lastMember = self.db.query(func.max(Member.MemberID)).first()
            if not all(lastMember):
                logger.error("createMember: No Member Found In Table !")
                newMemberID = 1
            else:
                newMemberID = lastMember[0] + 1
            newMember = Member(MemberID=newMemberID, **dict(member))
            if not newMember:
                logger.error("createMember: Error During Creating New Member !")
                return
            self.db.add(newMember)
            self.db.commit()
            self.db.close()
            logger.info("createMember: Successfully Creat New Member !")
            return newMember
        except Exception as ex:
            logger.error(f"createMember: {ex} !")
            return
    
    def getAllMember(self) -> (list[Member] | None):
        try:
            allMembers = self.db.query(Member).all()
            if not allMembers:
                logger.error("getAllMembers: No Members Found !")
                return
            logger.info("getAllMembers: Successfully Get All Members !")
            self.db.close()
            return allMembers
        except Exception as ex:
            logger.error(f"getAllMembers: {ex} !")
            return

    def getMemberByID(self, id: int) -> (Member | None):
        try:
            memberByID = self.db.query(Member).filter(Member.MemberID == id).first()
            if not memberByID:
                logger.error("getMemberByID: Member Not Found !")
                return
            logger.info("getMemberByID: Successfully Get Member By ID !")
            self.db.close()
            return memberByID
        except Exception as ex:
            logger.error(f"getMemberByID: {ex} !")
            return
    
    def updateMemberByID(self, id: int, member: MemberUpdateSchema) -> (Member | None):
        try:
            memberByID = self.db.query(Member).filter(Member.MemberID == id).first()
            if not memberByID:
                logger.error("updateMemberByID: Member Not Found !")
                return
            memberByID = memberByID.__dict__
            updateMember = {}
            for attribute in member:
                columnName = attribute[0]
                if attribute[1] == None:
                    updateMember[columnName] = memberByID[columnName]
                else:
                    updateMember[columnName] = attribute[1]
            self.db.query(Member).filter(Member.MemberID == id).update(updateMember)
            self.db.commit()
            self.db.close()
            logger.info("updateMemberByID: Successfully Update Member !")
            return memberByID
        except Exception as ex:
            logger.error(f"updateMemberByID: {ex} !")
            return
    
    def deleteMemberByID(self, id: int) -> (Member | None):
        try:
            memberByID = self.db.query(Member).filter(Member.MemberID == id).first()
            if not memberByID:
                logger.error("deleteMemberByID: Member Not Found !")
                return
            self.db.delete(memberByID)
            self.db.commit()
            self.db.close()
            logger.info("deleteMemberByID: Successfully Delete Member !")
            return memberByID
        except Exception as ex:
            logger.error(f"deleteMemberByID: {ex} !")
            return