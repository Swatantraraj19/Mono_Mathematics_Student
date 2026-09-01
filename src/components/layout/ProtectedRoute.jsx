import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Protected Route Guard for Student Application.
 * Evaluates full access lifecycle: checking, pending, inactive, active.
 */
export const ProtectedRoute = ({ children }) => {
  const { authStatus } = useAuth();
  const location = useLocation();

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Checking student access...</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (authStatus === 'pending') {
    return <Navigate to="/verification-pending" replace />;
  }

  if (authStatus === 'inactive') {
    return <Navigate to="/account-inactive" replace />;
  }

  return children ? children : <Outlet />;
};
