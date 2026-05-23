from contextlib import asynccontextmanager
from fastapi import FastAPI
from db.connectDB import connectDB
from controllers import EmpAccountController, EmployeeController, BranchController, RoleController, EmpContactController, MemberController, MembershipController, ClassController, ScheduleController, RoomController, EquipmentController, EquipmentListController, EquipmentMaintenanceController, ColeFitnessController
from utils.ColeFitnessMiddleware import ColeFitnessAuthMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: set up database connection
    print("Starting up the application...")
    try:
        connect = connectDB()
        if connect:
            print("Database connection established successfully")
            yield
        
    except Exception as e:
        print(f"Error during startup: {e}")
        raise

app = FastAPI(lifespan=lifespan,
              title="Cole Fitness Center")
authenticateMiddleware: ColeFitnessAuthMiddleware = ColeFitnessAuthMiddleware()
app.middleware("http")(authenticateMiddleware.authenticateRequest)
app.include_router(BranchController.router)
app.include_router(ClassController.router)
app.include_router(EmpAccountController.router)
app.include_router(EmpContactController.router)
app.include_router(EmployeeController.router)
app.include_router(MemberController.router)
app.include_router(MembershipController.router)
app.include_router(RoleController.router)
app.include_router(RoomController.router)
app.include_router(ScheduleController.router)
app.include_router(ColeFitnessController.router)
@app.get("/")
def main():
    return {"message": "Hello Cole Fitness !"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)