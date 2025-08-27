// frontend/src/pages/Admin/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  FileText, 
  Settings, 
  BarChart3,
  Bell,
  Calendar,
  LogOut
} from 'lucide-react';
import './Admin.css';

const Admin = () => {

    const { user, logout, isAdmin } = useAuth();

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