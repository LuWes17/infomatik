import React from 'react';
import ProtectedRoute from './ProtectedRoute';

// For admin-only routes
const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute 
      requireAuth={true} 
      roles={['admin']}
      redirectTo="/unauthorized"
    >
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute;