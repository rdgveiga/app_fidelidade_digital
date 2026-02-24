import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SkeletonLoader } from './SkeletonLoader';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!user) {
    const isClientPath = window.location.pathname.startsWith('/cliente');
    const isAdminPath = window.location.pathname.startsWith('/admin');

    if (isAdminPath) return <Navigate to="/admin" replace />;
    return <Navigate to={isClientPath ? "/cliente/login" : "/login"} replace />;
  }

  if (user.role === 'CLIENT' && user.mustChangePassword && window.location.pathname !== '/cliente/alterar-senha') {
    return <Navigate to="/cliente/alterar-senha" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirecionamento inteligente baseado no papel do usuário
    if (user.role === 'SHOPKEEPER') {
      const storeSlug = user.store?.slug || 'dashboard';
      return <Navigate to={`/shop/${storeSlug}/dashboard`} replace />;
    }
    if (user.role === 'CLIENT') {
      return <Navigate to="/cliente" replace />;
    }
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
