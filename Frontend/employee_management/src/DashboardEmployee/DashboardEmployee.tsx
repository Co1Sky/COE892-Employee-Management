import { FunctionComponent, useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./DashboardScreen.css";
import Header from '../Common/HeadersEmployee';

interface Shift {
  id: number;
  store_id: number;
  username: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shifts: string[]; // Assuming shifts is an array of strings
}

const DashboardEmployee: FunctionComponent = () => {
  const location = useLocation();
  const storeId = location.state?.storeId; // Retrieve store ID from route state
  console.log("Store ID:", storeId);
  const employeeId = location.state?.employeeId; // Retrieve store ID from route state
  console.log("Employee ID", employeeId);
  const username = location.state?.username; // Retrieve store ID from route state
  console.log("Username", username);
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    if (!storeId) {
      console.error("Store ID not provided");
      return;
    }

    if (!employeeId) {
      console.error("Employee ID not provided");
      return;
    }

    if (!username) {
      console.error("Username not provided");
      return;
    }

    if (username) {
      fetchShifts(username);
    }
  }, [storeId]); // Depend on storeId

  const fetchShifts = async (username: string) => {
    try {
      const queryParams = new URLSearchParams({ username }).toString();
      const response = await fetch(`https://api.colinpage.org/schedule/employee/${username}?${queryParams}`);
      console.log("username:", username);
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

  const requestShift = async (shiftId : number) => {
    if (!shiftId) {
      console.error('Username not provided');
      return;
    }
    alert('Shift cancellation requested!');
    //IMPLEMENT MESSAGING?
  };

  return (
    
    <main>
      <Header />
      <div className="container text-center">
        <h2>Store Schedule</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Shift Date</th>
              <th scope="col">Start Time</th>
              <th scope="col">End Time</th>
              <th scope="col">Cancel Shift</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift, index) => {
              console.log(`Shift at index ${index}:`, shift); // Debugging log
              return (
              <tr key={shift.id}>
                <td>{shift.shift_date}</td>
                <td>{shift.start_time}</td>
                <td>{shift.end_time}</td>
                <td><button onClick={() => requestShift(shift.id)}>Request</button></td>
              </tr> );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default DashboardEmployee;