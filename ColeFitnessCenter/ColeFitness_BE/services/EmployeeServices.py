from sqlalchemy.orm import Session
from sqlalchemy import func
from db.connectDB import logger
from db.models.Employee import Employee
from schemas.EmployeeSchema import EmployeeSchema, EmployeeUpdateSchema

class EmployeeServices:
    def __init__(self, db: Session):
        self.db = db
    
    def createEmployee(self, employee: EmployeeSchema) -> (Employee | None):
        try:
            lastEmployee = self.getLastEmployee()
            if not lastEmployee:
                logger.error("createEmployee: No Employee Found In Table !")
                newEmployeeID = 1
            else:
                newEmployeeID = lastEmployee.EmployeeID + 1      
            newEmployee = Employee(EmployeeID=newEmployeeID, **dict(employee))
            if not newEmployee:
                logger.error("createEmployee: Error During Creating New Employee !")
                return
            self.db.add(newEmployee)
            self.db.commit()
            logger.info("createEmployee: Successfully Creat New Employee !")
            return newEmployee
        except Exception as ex:
            logger.error(f"createEmployee: {ex} !")
            return
    
    def getAllEmployee(self) -> (list[Employee] | None):
        try:
            allEmployees = self.db.query(Employee).all()
            if not allEmployees:
                logger.error("getAllEmployees: No Employees Found !")
                return
            logger.info("getAllEmployees: Successfully Get All Employees !")
            self.db.close()
            return allEmployees
        except Exception as ex:
            logger.error(f"getAllEmployees: {ex} !")
            return
        
    def getEmployeeByID(self, id: int) -> (Employee | None):
        try:
            employeeByID = self.db.query(Employee).filter(Employee.EmployeeID == id).first()
            if not employeeByID:
                logger.error("getEmployeeByID: Employee Not Found !")
                return
            logger.info("getEmployeeByID: Successfully Get Employee By ID !")
            self.db.close()
            return employeeByID
        except Exception as ex:
            logger.error(f"getEmployeeByID: {ex} !")
            return
    
    def updateEmployeeByID(self, id: int, employee: EmployeeUpdateSchema) -> (Employee | None):
        try:
            employeeByID = self.db.query(Employee).filter(Employee.EmployeeID == id).first()
            if not employeeByID:
                logger.error("updateEmployeeByID: Employee Not Found !")
                return
            employeeByID = employeeByID.__dict__
            updateEmployee = {}
            for attribute in employee:
                columnName = attribute[0]
                if attribute[1] == None:
                    updateEmployee[columnName] = employeeByID[columnName]
                else:
                    updateEmployee[columnName] = attribute[1]
            self.db.query(Employee).filter(Employee.EmployeeID == id).update(updateEmployee)
            self.db.commit()
            self.db.close()
            logger.info("updateEmployeeByID: Successfully Update Employee !")
            return employeeByID
        except Exception as ex:
            logger.error(f"updateEmployeeByID: {ex} !")
            return
    
    def deleteEmployeeByID(self, id: int) -> (Employee | None):
        try:
            employeeByID = self.db.query(Employee).filter(Employee.EmployeeID == id).first()
            if not employeeByID:
                logger.error("deleteEmployeeByID: Employee Not Found !")
                return
            self.db.delete(employeeByID)
            self.db.commit()
            self.db.close()
            logger.info("deleteEmployeeByID: Successfully Delete Employee !")
            return employeeByID
        except Exception as ex:
            logger.error(f"deleteEmployeeByID: {ex} !")
    
    def getLastEmployee(self) -> (Employee | None):
        try:
            lastEmployee = self.db.query(Employee).filter(Employee.EmployeeID == self.db.query(func.max(Employee.EmployeeID))).first()
            if not lastEmployee:
                logger.info("getLastEmployee: No Last Employee Found !")
                return
            logger.info("Successfully Found Last Employee !")
            self.db.close()
            return lastEmployee
        except Exception as ex:
            logger.error(f"getLastEmployee: {ex} !")
            return