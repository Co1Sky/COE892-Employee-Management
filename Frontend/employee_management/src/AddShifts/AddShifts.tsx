import { FunctionComponent, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import Header from '../Common/HeadersManager';

const AddShifts: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedStartTime, setSelectedStartTime] = useState('');
    const [selectedEndTime, setSelectedEndTime] = useState('');
    const [username, setUsername] = useState('');
    const [storeId, setStoreId] = useState('');
    const [managerId, setManagerId] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const extractedUsername = queryParams.get('username');
        const extractedStoreId = queryParams.get('storeId');
        const extractedManagerId = queryParams.get('managerId');
    
        console.log('Extracted values:', extractedUsername, extractedStoreId, extractedManagerId);
    
        setUsername(extractedUsername || '');
        setStoreId(extractedStoreId || '');
        setManagerId(extractedManagerId || '');
    
        if (!extractedUsername) {
            console.error("Employee username not provided");
        }
        if (!extractedStoreId) {
            console.error("Store ID not provided");
        }
        if (!extractedManagerId) {
            console.error("Manager ID not provided");
        }
    }, [location]);

    const handleEnterBtn = async () => {
        // Construct the query parameters
        const queryParams = new URLSearchParams({ manager_id: managerId });

        const shiftData = {
            username: username,
            store_id: storeId,
            shift_date: selectedDate,
            start_time: selectedStartTime,
            end_time: selectedEndTime
        };

        console.log('Sending shift data:', shiftData);
    
        try {
            const response = await fetch(`https://api.colinpage.org/shifts/add?${queryParams.toString()}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Include the authorization header if needed
                    // "Authorization": `Bearer ${yourAuthToken}`,
                },
                body: JSON.stringify(shiftData),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                // Log the error data or show it to the user
                console.error('Error data:', errorData);
                throw new Error(errorData.detail || "Failed to add shift");
            }
    
            const responseData = await response.json();
            console.log("Shift added successfully:", responseData);
            // Navigate on success
            navigate("/dashboard-manager", { state: { storeId: responseData.store_id, managerId: responseData.manager_id } });
        } catch (error) {
            // Log the error message
            console.error('Error adding shift:', error);
            // Handle error (e.g., show an error message to the user)
        }
    };

    return (
        <main className="bg-body-secondary min-vh-100">
            <Header />
            <div className="container-fluid">
                <div className="col pb-5 text-center" style={{ paddingTop: '40px' }}>
                    <h1>Add Employee Shifts</h1>
                </div>
                <div className="row">
                    <div className="col rounded mx-2"></div>
                    <div className="col-8 rounded mx-2 text-bg-light">
                        <div className="mb-2 form-control text-start">
                            <label className="px-1 py-1" htmlFor="username">Employee Username</label>
                            <input type="text" className="form-control mb-3" id="username" placeholder="Employee Username" value={username} readOnly />
                            <div className="row mb-5 mt-2">
                                <div className="col">
                                    <label className="form-label" htmlFor="dateField">Date</label>
                                    <input 
                                        type="date" 
                                        className="form-control mb-2" 
                                        id="dateField" 
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)} 
                                    />
                                </div>
                                <div className="col">
                                    <label className="form-label" htmlFor="startTimeField">Start Time</label>
                                    <input 
                                        type="time" 
                                        className="form-control mb-2" 
                                        id="startTimeField" 
                                        value={selectedStartTime}
                                        onChange={(e) => setSelectedStartTime(e.target.value)}
                                    />
                                </div>
                                <div className="col">
                                    <label className="form-label" htmlFor="endTimeField">End Time</label>
                                    <input 
                                        type="time" 
                                        className="form-control mb-2" 
                                        id="endTimeField" 
                                        value={selectedEndTime}
                                        onChange={(e) => setSelectedEndTime(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button onClick={handleEnterBtn} type="button" className="btn btn-secondary">Add Shift</button>
                        </div>
                    </div>
                    <div className="col rounded mx-2"></div>
                </div>
            </div>
        </main>
    );
};

export default AddShifts;
