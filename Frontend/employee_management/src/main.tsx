import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import './global.css'
import MainMenu from './MainMenu/MainMenu'
import Register from './RegisterPage/RegisterPage'
import AdminScreen from './AdminScreen/AdminScreen'
import EmployeeScreen from './EmployeeScreen/EmployeeScreen'
import ChooseRole from './ChooseRole/ChooseRole'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path='/' element={<MainMenu />} /> 
        <Route path='/admin-dashboard' element={<AdminScreen />} />
        <Route path='/employee-dashboard' element={<EmployeeScreen />} />
        <Route path='/register-user' element={<Register />} />
        <Route path='/choose-role' element={<ChooseRole />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
