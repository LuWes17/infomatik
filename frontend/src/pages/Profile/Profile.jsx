import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRound, Pencil, Phone, MapPin, Calendar, LogOut} from 'lucide-react';
import './Profile.css';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Format as "Month Year" (e.g., "January 2024")
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

const Profile = () => {
  const { user, logout, isAdmin } = useAuth();
  
    const handleLogout = async () => {
      await logout();
    };

  return (
    <div className="dashboard-container">
     <div className='profile-container'>
      <div className='profile-card'>
        <div className='edit-container'>
            <Pencil size={20}/>
        </div>
        <div className='name-container'>
            <UserRound size={36} />
            <p className='name-text'>{user?.firstName}, {user?.lastName}</p>
        </div>
        <div className='profile-details'>
            <div className='phone-container'>
                <Phone size={22} />
                <p className='profile-text'>{user?.contactNumber}</p>
            </div>
            <div className='phone-container'>
                <MapPin size={22} />
                <p className='profile-text'>{user?.barangay}</p>
            </div>
            <div className='phone-container'>
                <Calendar size={22} />
                <p className='profile-text'>Member since {formatDate(user?.createdAt)}</p>
            </div>
        </div>
      </div>
    <div className='logout-container' onClick={handleLogout}>
        <LogOut size={22} />
        <p>Logout</p>
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

export default Profile;