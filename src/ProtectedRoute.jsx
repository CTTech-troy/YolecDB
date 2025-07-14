import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('user') !== null;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location, message: 'You must log in to access the dashboard.' }}
      />
    );
  }

  return children;
}
