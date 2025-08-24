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
      <div className="dashboard-header">
        <h1>Welcome, {user?.firstName}!</h1>
        <p className="dashboard-subtitle">
          Your dashboard for accessing city councilor services
        </p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          {/* User Info Card */}
          <div className="dashboard-card">
            <h3>Your Information</h3>
            <div className="user-info">
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Contact:</strong> {user?.contactNumber}</p>
              <p><strong>Barangay:</strong> {user?.barangay}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Status:</strong> 
                <span className={`status-badge ${user?.isVerified ? 'verified' : 'unverified'}`}>
                  {user?.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </p>
            </div>
            <Link to="/profile" className="dashboard-button secondary">
              Edit Profile
            </Link>
          </div>

          {/* Quick Actions Card */}
          <div className="dashboard-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/services" className="action-link">
                📋 Apply for Services
              </Link>
              <Link to="/my-applications" className="action-link">
                📊 View My Applications
              </Link>
              <Link to="/announcements" className="action-link">
                📢 Latest Announcements
              </Link>
              <a href="#feedback" className="action-link">
                💬 Submit Feedback
              </a>
            </div>
          </div>

          {/* Admin Panel (if admin) */}
          {isAdmin() && (
            <div className="dashboard-card admin-card">
              <h3>Admin Panel</h3>
              <div className="admin-actions">
                <Link to="/admin" className="action-link admin">
                  ⚙️ Admin Dashboard
                </Link>
                <Link to="/admin/users" className="action-link admin">
                  👥 Manage Users
                </Link>
                <Link to="/admin/applications" className="action-link admin">
                  📝 Review Applications
                </Link>
              </div>
            </div>
          )}

          {/* Recent Activity Card */}
          <div className="dashboard-card">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-date">Today</span>
                <span className="activity-text">Account created successfully</span>
              </div>
              <div className="activity-item">
                <span className="activity-date">-</span>
                <span className="activity-text">No recent applications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="dashboard-footer">
          <button onClick={handleLogout} className="dashboard-button danger">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;