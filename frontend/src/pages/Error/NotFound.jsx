import React from 'react';
import { Link } from 'react-router-dom';
import './Error.css';

const NotFound = () => {
  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="error-actions">
          <Link to="/" className="error-button primary">
            Go Home
          </Link>
          <Link to="/services" className="error-button secondary">
            View Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;