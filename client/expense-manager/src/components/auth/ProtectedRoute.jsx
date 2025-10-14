import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../lib/contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
 

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  

  // Check role-based access if specific roles are required
  if (allowedRoles.length > 0 && user.role) {
    console.log(user.role);
    console.log(allowedRoles);
    const userRole = user.role?.toLowerCase();
    
    const hasPermission = allowedRoles.includes(userRole)
    
    console.log(hasPermission);
    if (!hasPermission) {
      toast.dismiss();
      toast.error('You do not have permission to access this page');
      
      // Redirect to appropriate dashboard based on user role
      const userRole = user.role?.toLowerCase();
      if (userRole === 'manager') {
        return <Navigate to="/manager-dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;