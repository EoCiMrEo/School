from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.Branch import Branch
from schemas.BranchSchema import BranchSchema, BranchUpdateSchema

class BranchServices:
    def __init__(self, db: Session):
        self.db = db

    def createBranch(self, branch: BranchSchema) -> (Branch | None):
        try:
            lastBranch = self.db.query(func.max(Branch.BranchID)).first()
            if not all(lastBranch):
                logger.error("createBranch: No Branch Found In Table !")
                newBranchID = 1
            else:
                newBranchID = lastBranch[0] + 1
            newBranch = Branch(BranchID=newBranchID,**dict(branch))
            if not newBranch:
                logger.error("createBranch: Error During Creating New Branch !")
                return
            self.db.add(newBranch)
            self.db.commit()
            self.db.close()
            logger.info("createBranch: Successfully Create New Branch !")
            return newBranch
        except Exception as ex:
            logger.error(f"createBranch: {ex} !")
            return
    
    def getAllBranch(self) -> (list[Branch] | None):
        try:
            allBranches = self.db.query(Branch).all()
            if not allBranches:
                logger.error("getAllBranch: No Branches Found !")
                return
            logger.info("getAllBranch: Successfully Get All Branches !")
            self.db.close()
            return allBranches
        except Exception as ex:
            logger.error(f"getAllBranch: {ex} !")
            return

    def getBranchByID(self, id: int) -> (Branch | None):
        try:
            branchByID = self.db.query(Branch).filter(Branch.BranchID == id).first()
            if not branchByID:
                logger.error("getBranchByID: Branch Not Found !")
                return
            logger.info("getBranchByID: Successfully Get Branch By ID !")
            self.db.close()
            return branchByID
        except Exception as ex:
            logger.error(f"getBranchByID: {ex} !")
            return
    
    def updateBranchByID(self, id: int, branch: BranchUpdateSchema) -> (Branch | None):
        try:
            branchByID = self.db.query(Branch).filter(Branch.BranchID == id).first()
            if not branchByID:
                logger.error("updateBranchByID: Branch Not Found !")
                return
            branchByID = branchByID.__dict__
            updateBranch = {}
            for attribute in branch:
                columnName = attribute[0]
                if attribute[1] == None:
                    updateBranch[columnName] = branchByID[columnName]
                else:
                    updateBranch[columnName] = attribute[1]
            self.db.query(Branch).filter(Branch.BranchID == id).update(updateBranch)
            self.db.commit()
            self.db.close()
            logger.info("updateBranchByID: Successfully Update Branch !")
            return branchByID
        except Exception as ex:
            logger.error(f"updateBranchByID: {ex} !")
            return
    
    def deleteBranchByID(self, id: int) -> (Branch | None):
        try:
            branchByID = self.db.query(Branch).filter(Branch.BranchID == id).first()
            if not branchByID:
                logger.error("deleteBranchByID: Branch Not Found !")
                return
            self.db.delete(branchByID)
            self.db.commit()
            self.db.close()
            logger.info("deleteBranchByID: Successfully Delete Branch !")
            return branchByID
        except Exception as ex:
            logger.error(f"deleteBranchByID: {ex} !")
            return
        