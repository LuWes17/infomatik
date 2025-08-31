// frontend/src/layouts/ProfileLayout.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Edit3, Lock, LogOut } from 'lucide-react';
import EditProfileModal from '../components/profile/EditProfileModal';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import styles from './ProfileLayout.module.css';

const ProfileLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  return (
    <div className={styles.profileContainer}>
      {/* Left Side - Profile Card */}
      <div className={styles.profileSidebar}>
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              <User size={48} />
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </h2>
              <p className={styles.profileEmail}>
                {user?.contactNumber}
              </p>
              <p className={styles.profileBarangay}>
                {user?.barangay && `Barangay ${user.barangay.charAt(0).toUpperCase() + user.barangay.slice(1)}`}
              </p>
            </div>
          </div>
          
          <div className={styles.profileActions}>
            <button 
              className={styles.actionButton}
              onClick={handleEditProfile}
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
            <button 
              className={styles.actionButton}
              onClick={handleChangePassword}
            >
              <Lock size={16} />
              Change Password
            </button>
          </div>
        </div>

        <button 
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Right Side - Content Area with Navigation */}
      <div className={styles.profileContent}>
        <nav className={styles.profileNav}>
          <NavLink 
            to="/profile/job-applications" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Job Applications
          </NavLink>
          <NavLink 
            to="/profile/solicitation-requests" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Solicitation Requests
          </NavLink>
          <NavLink 
            to="/profile/feedback-sent" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Feedback Sent
          </NavLink>
        </nav>

        <div className={styles.profileMain}>
          {children}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditProfileModal 
          onClose={() => setShowEditModal(false)} 
        />
      )}
      {showPasswordModal && (
        <ChangePasswordModal 
          onClose={() => setShowPasswordModal(false)} 
        />
      )}
    </div>
  );
};

export default ProfileLayout;