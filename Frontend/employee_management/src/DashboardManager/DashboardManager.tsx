import { FunctionComponent, useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./DashboardScreen.css";
import Header from '../Common/HeadersManager';

interface Employee {
  id: number;
  store_id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  shifts: string[]; // Assuming shifts is an array of strings
}

interface Shift {
  id: number;
  store_id: number;
  username: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shifts: string[]; // Assuming shifts is an array of strings
}

const DashboardManager: FunctionComponent = () => {
  const location = useLocation();
  const storeId = location.state?.storeId; // Retrieve store ID from route state
  console.log("Store ID:", storeId);
  const managerId = location.state?.managerId; // Retrieve store ID from route state
  console.log("Manager ID", managerId);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    if (!storeId) {
      console.error("Store ID not provided");
      return;
    }

    if (!managerId) {
      console.error("Manager ID not provided");
      return;
    }

    if (managerId) {
      fetchShifts(managerId);
    }

    const fetchEmployees = async () => {
      try {
        const response = await fetch(`https://api.colinpage.org/employees/${storeId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, [storeId]); // Depend on storeId

  const fetchShifts = async (username: string) => {
    try {
      const queryParams = new URLSearchParams({ username }).toString();
      const response = await fetch(`https://api.colinpage.org/schedule/manager/${managerId}`);
      console.log("Manager ID:", managerId , queryParams);
      if (!response.ok) {
        const errorResponse = await response.text();
        throw new Error(`Could not fetch shifts: ${response.status} - ${errorResponse}`);
      }
      const data = await response.json();
      setShifts(data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };  

  const removeShift = async (shiftId : number) => {
    if (!managerId) {
      console.error('Manager ID not provided');
      return;
    }
    
    try {
      // Include manager_id directly in the query string
      console.log("Shift ID:", shiftId)
      const response = await fetch(`https://api.colinpage.org/shifts/delete/${shiftId}?manager_id=${managerId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error data:', errorData);
        alert(`Failed to delete shift: ${errorData.detail || 'Unknown error'}`);
        return;
      }
  
      // Response handling
      const responseData = await response.json();
      console.log("Shift deleted successfully:", responseData);
      setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftId));
      alert('Shift deleted successfully');
    } catch (error) {
      console.error('Error deleting shift:', error);
      alert('Error deleting shift');
    }
  };

  return (
    <main>
      <Header />
      <div className="container text-center">
        <h2>All Employees</h2>
        <div className="row">
          <div className="col border rounded mx-1">
            <div className="table-row row border rounded m-1 overflow-y-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Employee Username</th>
                    <th scope="col">First Name</th>
                    <th scope="col">Last Name</th>
                    <th scope="col">Email Address</th>
                    <th scope="col">Add Shifts</th>
                    <th scope="col">View Shifts</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(employee => (
                    <tr key={employee.id}>
                      <td>{employee.username}</td>
                      <td>{employee.first_name}</td>
                      <td>{employee.last_name}</td>
                      <td>{employee.email}</td>
                      <td>
                        <a href={`/add-shift?username=${employee.username}&storeId=${storeId}&managerId=${managerId}`}>Add Shifts</a>
                      </td>
                      <td>
                        <a href={`/view-shifts?username=${employee.username}&storeId=${storeId}&managerId=${managerId}`}>View Shifts</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="container text-center">
        <h2>Store Schedule</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Employee Username</th>
              <th scope="col">Shift Date</th>
              <th scope="col">Start Time</th>
              <th scope="col">End Time</th>
              <th scope="col">Remove Shift</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift, index) => {
              console.log(`Shift at index ${index}:`, shift); // Debugging log
              return (
              <tr key={shift.id}>
                <td>{shift.username}</td>
                <td>{shift.shift_date}</td>
                <td>{shift.start_time}</td>
                <td>{shift.end_time}</td>
                <td><button onClick={() => removeShift(shift.id)}>Remove</button></td>
              </tr> );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default DashboardManager;