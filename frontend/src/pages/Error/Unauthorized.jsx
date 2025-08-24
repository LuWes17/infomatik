// frontend/src/pages/Error/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Error.css';

const Unauthorized = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="error-code">403</h1>
        <h2 className="error-title">Access Denied</h2>
        <p className="error-message">
          You don't have permission to access this resource.
        </p>
        <div className="error-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="error-button primary">
                Go to Dashboard
              </Link>
              <Link to="/" className="error-button secondary">
                Go Home
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="error-button primary">
                Login
              </Link>
              <Link to="/" className="error-button secondary">
                Go Home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;