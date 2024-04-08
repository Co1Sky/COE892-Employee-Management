import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from '../Common/HeadersManager';

interface ShiftDelete {
  id: number;
  username: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  store_id: number;
  shifts: string[]; // Assuming shifts is an array of strings
}

const ViewShifts = () => {
  const location = useLocation();
  const [shifts, setShifts] = useState<ShiftDelete[]>([]);
  const [username, setUsername] = useState('');
  const [storeId, setStoreId] = useState('');
  const [managerId, setManagerId] = useState('');

  console.log("Initial", username, storeId, managerId);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const extractedUsername = queryParams.get('username');
    const extractedStoreId = queryParams.get('storeId');
    const extractedManagerId = queryParams.get('managerId');

    console.log('Extracted values:', extractedUsername, extractedStoreId, extractedManagerId);

    setUsername(extractedUsername || '');
    setStoreId(extractedStoreId || '');
    setManagerId(extractedManagerId || '');

    if (extractedUsername) {
      fetchShifts(extractedUsername);
    }
  }, [location]);

  const fetchShifts = async (username: string) => {
    try {
      const queryParams = new URLSearchParams({ username }).toString();
      const response = await fetch(`https://api.colinpage.org/schedule/employee/{employee_username}?${queryParams}`);
      console.log("Employee Username:", username);
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
        <h2>View Employee Shifts</h2>
        <table className="table">
          <thead>
            <tr>
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

export default ViewShifts;
