# Running the Employee Management System Locally

## Make a copy of the repository on your local machine
1. Download here: https://github.com/Co1Sky/COE892-Employee-Management/archive/refs/heads/main.zip
2. Unzip the folder

## Backend Server
1. Navigate to ../COE892-Employee-Management/backend
2. Run this command to install the requirements:
    - pip install -r requirements.txt
4. Run this command
    - uvicorn main:app --reload
5. The following should appear in your terminal once the server is connected successfully:
     ![image](https://github.com/Co1Sky/COE892-Employee-Management/assets/73681817/2b5f8403-0525-4e9a-b0d8-9c5b6eb74236)

## Frontend Server
1. Navigate to ../COE892-Employee-Management/Frontend/employee_management
2. Run this command to install packages:
    - npm install
3. Run this command to start the frontend server:
    - npm run dev
4. The following should appear once the server is connected successfully:
   ![image](https://github.com/Co1Sky/COE892-Employee-Management/assets/73681817/46a3a7bb-3807-4823-b7d8-fad81b451ade)

# Employee Management System Functionality
## REGISTRATION/LOGIN
### Manager Registration
- store_id → has to match existing store in database
- manager_id
- first_name
- last_name
- username
- email
- password
 
### Manager Login
- Username
- Password

### Employee Registration
- store_id → has to match existing store in database
- employee_id
- first_name
- last_name
- username
- email
- password

### Employee Login
- Username
- Password

## MANAGERS
### Dashboard:
- View All Employees from Store → based on store_id of manager 
    - first_name
    - last_name
    - Email
- View Store Schedule
    - View all shifts for all employees at their store
    - Able to delete shifts directly from here
### Add Shifts
- Can add new shifts for employees
### View Shifts
- Can view shifts for specific employees

## EMPLOYEES
### Dashboard:
- View Schedule
- View own shifts and can request to cancel a shift
