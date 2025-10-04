import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      
      // If no specific roles are required or user role is in allowed roles
      if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
        setIsAuthorized(true);
      } else {
        toast.error('You do not have permission to access this page');
        setIsAuthorized(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [allowedRoles]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  if (!isAuthorized) {
    // Save the location they tried to access for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

export default ProtectedRoute;