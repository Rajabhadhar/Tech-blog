import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the token exists in local storage
  const token = localStorage.getItem('adminToken');

  // If there is no token, redirect the user to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If they have a token, let them see the page (render the children)
  return children;
};

export default ProtectedRoute;