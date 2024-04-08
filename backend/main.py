from fastapi import FastAPI, HTTPException, Depends, Path, Query, status
from typing import List
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from database import SessionLocal, engine
import models
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()

origins = ["*"]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class ManagerRegistration(BaseModel):
    store_id: int
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    password: str

    @validator('password')
    def hash_password(cls, v):
        return pwd_context.hash(v)

class EmployeeRegistration(ManagerRegistration):
    pass

class UserLogin(BaseModel):
    username: str
    password: str

class ShiftView(BaseModel):
    id: int
    username: str
    store_id: int
    shift_date: str
    start_time: str
    end_time: str

    class Config:
        orm_mode = True

class ShiftCreate(BaseModel):
    username: str
    store_id: int
    shift_date: str
    start_time: str
    end_time: str

    class Config:
        orm_mode = True

class ShiftDelete(BaseModel):
    id: int

    class Config:
        orm_mode = True

# Initialize database with stores
def init_db():
    db = SessionLocal()
    try:
        # Check if stores already exist to avoid duplicates
        if db.query(models.Store).count() == 0:
            for i in range(1, 101):
                store = models.Store(name=f"Store {i}", location=f"Location {i}")
                db.add(store)
            db.commit()
    finally:
        db.close()

# Dependency function to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Populate the database with stores
init_db()

# Unique Username and Email
def is_unique_username_email(username: str, email: str, db: Session):
    exists_in_managers = db.query(models.Manager).filter(
        (models.Manager.username == username) | (models.Manager.email == email)
    ).first()

    exists_in_employees = db.query(models.Employee).filter(
        (models.Employee.username == username) | (models.Employee.email == email)
    ).first()

    return not exists_in_managers and not exists_in_employees

# Manager Registration
@app.post("/register/manager")
def register_manager(manager: ManagerRegistration, db: Session = Depends(get_db)):
    if not is_unique_username_email(manager.username, manager.email, db):
        raise HTTPException(status_code=400, detail="Username or email already in use")
    
    db_manager = models.Manager(**manager.dict())
    db.add(db_manager)
    try:
        db.commit()
        db.refresh(db_manager)
        return {
            "message": "Manager registered successfully",
            "store_id": db_manager.store_id,
            "manager_id": db_manager.id,
            "manager_username": db_manager.username
        }
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Manager registration failed, possibly due to duplicate data")

# Employee Registration
@app.post("/register/employee")
def register_employee(employee: EmployeeRegistration, db: Session = Depends(get_db)):
    if not is_unique_username_email(employee.username, employee.email, db):
        raise HTTPException(status_code=400, detail="Username or email already in use")

    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    try:
        db.commit()
        db.refresh(db_employee)
        return {
            "message": "Employee registered successfully",
            "store_id": db_employee.store_id,
            "employee_id": db_employee.id,
            "employee_username": db_employee.username
        }
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Employee registration failed, possibly due to duplicate data")

# Manager Login
@app.post("/login/manager")
def login_manager(user: UserLogin, db: Session = Depends(get_db)):
    db_manager = db.query(models.Manager).filter(models.Manager.username == user.username).first()
    if db_manager and pwd_context.verify(user.password, db_manager.password):
        return {
            "message": "Login successful",
            "store_id": db_manager.store_id,
            "manager_id": db_manager.id,
            "manager_username": db_manager.username
        }
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

# Employee Login
@app.post("/login/employee")
def login_employee(user: UserLogin, db: Session = Depends(get_db)):
    db_employee = db.query(models.Employee).filter(models.Employee.username == user.username).first()
    if db_employee and pwd_context.verify(user.password, db_employee.password):
        return {
            "message": "Login successful",
            "store_id": db_employee.store_id,
            "employee_id": db_employee.id,
            "employee_username": db_employee.username
        }
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

# View All Employees from Store
@app.get("/employees/{store_id}", response_model=List[EmployeeRegistration])
def get_employees(store_id: int, db: Session = Depends(get_db)):
    employees = db.query(models.Employee).filter(models.Employee.store_id == store_id).all()
    return employees

# View Schedule for Manager
@app.get("/schedule/manager/{manager_id}", response_model=List[ShiftView])
def get_schedule_manager(manager_id: int, db: Session = Depends(get_db)):
    manager = db.query(models.Manager).filter(models.Manager.id == manager_id).first()
    shifts = db.query(models.EmployeeShifts).filter(models.EmployeeShifts.store_id == manager_id).all()
    return shifts

# Add Shifts
@app.post("/shifts/add")
def add_shift(shift: ShiftCreate, manager_id: int, db: Session = Depends(get_db)):
    # Check if the manager exists and retrieve the manager's store_id
    manager = db.query(models.Manager).filter(models.Manager.id == manager_id).first()
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    # Check if the employee exists and belongs to the same store as the manager
    employee = db.query(models.Employee).filter(models.Employee.username == shift.username).first()
    if not employee or employee.store_id != manager.store_id:
        raise HTTPException(status_code=403, detail="Manager is not authorized to add shifts for this employee")

    # Create the shift with the employee ID
    shift_data = {
        "username": shift.username,
        "store_id": shift.store_id,
        "shift_date": shift.shift_date,
        "start_time": shift.start_time,
        "end_time": shift.end_time
    }
    db_shift = models.EmployeeShifts(**shift_data)
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    return {
        "message": "Shift added successfully",
        "store_id": manager.store_id,
        "manager_id": manager.id,
        "manager_username": manager.username
    }

# Delete Shifts
@app.delete("/shifts/delete/{shift_id}")
def delete_shift(
    shift_id: int = Path(..., description="The ID of the shift to delete"),
    manager_id: int = Query(..., description="The ID of the manager making the request"),
    db: Session = Depends(get_db)
):
    # Check if the manager exists and retrieve the manager's store_id
    manager = db.query(models.Manager).filter(models.Manager.id == manager_id).first()
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")
    
    # Use the shift_id from the path to find the shift
    shift = db.query(models.EmployeeShifts).filter(models.EmployeeShifts.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    db.delete(shift)
    db.commit()
    return {
        "message": "Shift deleted successfully",
        "store_id": manager.store_id,
        "manager_id": manager.id,
        "manager_username": manager.username
    }

# View Schedule for Employee
@app.get("/schedule/employee/{employee_username}", response_model=List[ShiftView])
def get_schedule_employee(username: str, db: Session = Depends(get_db)):
    shifts = db.query(models.EmployeeShifts).filter(models.EmployeeShifts.username == username).all()
    return shifts

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)