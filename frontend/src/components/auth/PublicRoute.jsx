import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// For pages that should only be accessible to non-authenticated users
const PublicRoute = ({ children, redirectTo = '/dashboard' }) => {
  return (
    <ProtectedRoute 
      requireAuth={false} 
      redirectTo={redirectTo}
    >
      {children}
    </ProtectedRoute>
  );
};

export default PublicRoute;
