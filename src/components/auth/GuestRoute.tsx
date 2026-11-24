import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useUserAuth } from '../../modules/authentication/providers/context/useAuthContext';
import { getDashboardByRole } from '../../utils/routeConfig';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * GuestRoute component for routes that should only be accessible to non-authenticated users
 * 
 * Examples: Login pages, registration pages, forgot password pages
 * 
 * - If user is authenticated, redirects to their role's dashboard
 * - If user is not authenticated, renders the children (login form, etc.)
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, role } = useUserAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-weak">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary-base animate-spin" />
          <p className="text-text-sub">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to user's dashboard
  if (isAuthenticated && role) {
    const dashboardUrl = getDashboardByRole(role);
    return <Navigate to={dashboardUrl} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
