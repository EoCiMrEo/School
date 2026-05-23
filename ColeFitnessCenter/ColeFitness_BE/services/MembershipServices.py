from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.Membership import Membership
from schemas.MembershipSchema import MembershipSchema, MembershipUpdateSchema

class MembershipServices:
    def __init__(self, db: Session) -> None:
        self.db = db
    
    def getAllMembership(self) -> (list[Membership] | None):
        try:
            allMemberships = self.db.query(Membership).all()
            if not allMemberships:
                logger.error("getAllMemberships: No Membership Found !")
                return
            logger.info("getAllMemberships: Successfully Get All Memberships !")
            self.db.close()
            return allMemberships
        except Exception as ex:
            logger.error(f"getAllMemberships: {ex} !")
            return
    
    def getMembershipByID(self, id: int) -> (Membership | None):
        try:
            membershipByID = self.db.query(Membership).filter(Membership.MembershipID == id).first()
            if not membershipByID:
                logger.error("getMembershipByID: Membership Not Found With Given ID!")
                return
            logger.info("getMembershipByID: Successfully Get Membership By ID !")
            self.db.close()
            return membershipByID
        except Exception as ex:
            logger.error(f"getMembershipByID: {ex} !")
            return
    
    def createMembership(self, membership: MembershipSchema) -> (Membership | None):
        try:
            lastMembership = self.db.query(func.max(Membership.MembershipID)).first()
            if not all(lastMembership):
                logger.info("createMembership: No Membership Found In Table !")
                newMembershipID = 1
            else:
                newMembershipID = lastMembership[0] + 1
            newMembership = Membership(MembershipID=newMembershipID, **dict(membership))
            if not newMembership:
                logger.error("createMembership: Error During Creating New Membership !")
                return
            self.db.add(newMembership)
            self.db.commit()
            self.db.close()
            logger.info("createMembership: Successfully Creat New Membership !")
            return newMembership
        except Exception as ex:
            logger.error(f"createMembership: {ex} !")
            return
    
    def updateMembershipByID(self, id: int, membership: MembershipUpdateSchema) -> (Membership | None):
        try:
            membershipByID = self.db.query(Membership).filter(Membership.MembershipID == id).first()
            if not membershipByID:
                logger.error("updateMembershipByID: Membership Not Found !")
                return
            membershipByID = membershipByID.__dict__
            updateMembership = {}
            for attribute in membership:
                columnName = attribute[0]
                if attribute[1] == None:
                    updateMembership[columnName] = membershipByID[columnName]
                else:
                    updateMembership[columnName] = attribute[1]
            self.db.query(Membership).filter(Membership.MembershipID == id).update(updateMembership)
            self.db.commit()
            self.db.close()
            logger.info("updateMembershipByID: Successfully Update Membership !")
            return membershipByID
        except Exception as ex:
            logger.error(f"updateMembershipByID: {ex} !")
            return
    
    def deleteMembershipByID(self, id: int) -> (Membership | None):
        try:
            membershipByID = self.db.query(Membership).filter(Membership.MembershipID == id).first()
            if not membershipByID:
                logger.error("deleteMembershipByID: Membership Not Found !")
                return
            self.db.delete(membershipByID)
            self.db.commit()
            self.db.close()
            logger.info("deleteMembershipByID: Successfully Delete Membership !")
            return membershipByID
        except Exception as ex:
            logger.error(f"deleteMembershipByID: {ex} !")
            return