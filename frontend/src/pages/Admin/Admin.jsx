// frontend/src/pages/Admin/AdminDashboard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import './Admin.css';

const Admin = () => {

    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();


    const handleLogout = async () => {
      await logout();
    };


  return (
    <div>Admin
        <div className='logout-container' onClick={handleLogout}>
            <LogOut size={22} />
            <p>Logout</p>
        </div>
    </div>
    
  )
}

export default Admin