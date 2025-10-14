import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { currentUser, userData } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(userData?.role)) {
    // If roles are specified and user's role is not in the list, redirect to home
    return <Navigate to="/" />;
  }
  
  return children;
};

export default ProtectedRoute;
