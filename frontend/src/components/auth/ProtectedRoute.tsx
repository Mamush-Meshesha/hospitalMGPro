import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPrivileges?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, requiredPrivileges }) => {
  const { user, token, hasRole, hasPrivilege } = useAuth();
  const location = useLocation();

  if (!token || !user) {
    // Not logged in
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  let accessGranted = true;

  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasRole(allowedRoles)) {
      accessGranted = false;
    }
  }

  if (requiredPrivileges && requiredPrivileges.length > 0) {
    if (!hasPrivilege(requiredPrivileges)) {
      accessGranted = false;
    }
  }

  if (!accessGranted) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6 space-y-4">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Access Denied</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          You do not have the required permissions to view this module. If you believe this is an error, please contact your system administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
