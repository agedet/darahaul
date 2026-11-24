import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import {
  getDashboardByRole,
  getLoginByPath,
  isRouteAllowedForRole,
} from '../../utils/routeConfig';
import { URLS } from '../../utils/routes';
import { useUserAuth } from '../../modules/authentication/providers/context/useAuthContext';
import { normalizeAllowedRoles, requiresOnboarding } from '../../lib/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * ProtectedRoute component that validates authentication and role-based access
 *
 * - If user is not authenticated, redirects to login
 * - Driver/mechanic users with incomplete onboarding are sent to /onboarding
 * - Users who don't need onboarding can't stay on /onboarding
 * - allowedRoles are compared after role normalization (backend sends UPPERCASE)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, role, user } = useUserAuth();
  const location = useLocation();

  const isOnboardingRoute = location.pathname === URLS.ONBOARDING;
  const needsOnboarding = Boolean(
    user && requiresOnboarding(role) && !user.onboardingCompleted,
  );

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

  if (!isAuthenticated) {
    const loginUrl = getLoginByPath(location.pathname);
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${loginUrl}?redirectUrl=${redirectUrl}`} replace />;
  }

  if (needsOnboarding && !isOnboardingRoute) {
    return <Navigate to={URLS.ONBOARDING} replace />;
  }

  if (!needsOnboarding && isOnboardingRoute) {
    return <Navigate to={getDashboardByRole(role)} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !isOnboardingRoute) {
    const normalizedAllowed = normalizeAllowedRoles(allowedRoles);
    if (!role || !normalizedAllowed.includes(role)) {
      return <Navigate to={getDashboardByRole(role)} replace />;
    }
  }

  if (
    role &&
    !isOnboardingRoute &&
    !isRouteAllowedForRole(location.pathname, role)
  ) {
    return <Navigate to={getDashboardByRole(role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
