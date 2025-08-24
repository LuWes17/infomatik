import React from 'react';
import ProtectedRoute from './ProtectedRoute';

// For routes that require specific roles
const RoleRoute = ({ children, roles = [], redirectTo = '/unauthorized' }) => {
  return (
    <ProtectedRoute 
      requireAuth={true} 
      roles={roles}
      redirectTo={redirectTo}
    >
      {children}
    </ProtectedRoute>
  );
};

export default RoleRoute;