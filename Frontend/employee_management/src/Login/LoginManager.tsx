import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
//import Cookies from 'universal-cookie';
import "./Login.css";

const LoginManager: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();
  
    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
          const userData = { username: username.toLowerCase(), password };
          const response = await fetch("https://api.colinpage.org/login/manager", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(userData),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || "Failed to login");
          }

          const responseData = await response.json();
          console.log("Login successful:", responseData);
          
          // Assuming responseData includes the store ID
          navigate("/dashboard-manager", { state: { storeId: responseData.store_id, managerId: responseData.manager_id } });
      } catch (error: any) {
          setErrorMessage(error.message || 'Failed to login. Please try again later.');
      }
    };

  return (
    <div className="form-container">
      <form className="signin-form" onSubmit={handleLogin}>
        <h2 className="form-title text-center">MANAGER LOGIN</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <input
          className="form-input"
          type="username"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
        />
        <input
          className="form-input"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />
        <button className="form-button" type="submit">Login</button>
        <div className="need-to-register">
          <p>Need to Register?</p>
          <button className="continue-button" onClick={() => navigate('/register-manager')} type="button">Register</button>
        </div>
        <div className="need-to-register">
          <p>Not a Manager?</p>
          <button className="continue-button" onClick={() => navigate('/login-employee')} type="button">EMPLOYEE LOGIN</button>
        </div>
      </form>
    </div>
  );
};

export default LoginManager;
