import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  roles = [], 
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If route requires specific roles and user doesn't have them
  if (roles.length > 0 && (!user || !roles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If route should only be accessible to unauthenticated users (like login page)
  if (!requireAuth && isAuthenticated) {
    // Redirect authenticated users away from auth pages
    const from = location.state?.from?.pathname || '/profile';
    return <Navigate to={from} replace />;
  }

  return children;
};

export default ProtectedRoute;