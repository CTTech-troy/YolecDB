import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        Checking session…
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location, message: 'You must log in to access the dashboard.' }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Access denied</h1>
        <p className="text-gray-600 max-w-md">
          This account is signed in but does not have admin privileges. Ask an owner to run{' '}
          <code className="text-sm bg-gray-200 px-1 rounded">npm run set-admin -- &lt;your-email&gt;</code> in the API project.
        </p>
      </div>
    );
  }

  return children;
}
