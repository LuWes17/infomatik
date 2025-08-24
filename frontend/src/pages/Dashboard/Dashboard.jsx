import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard-container">
     <div className='profile-container'>
      <div className='profile-card'>

      </div>
     </div>
     <div className='manage-container'>
      <div className='header'>
        <p> Job Application</p>
        <p> Solicitation Request</p>
        <p> Feedback Sent</p>
      </div>
     </div>
    </div>
  );
};

export default Dashboard;