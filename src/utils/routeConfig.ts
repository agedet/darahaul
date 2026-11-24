/**
 * Route configuration for role-based access control.
 * Roles are canonical frontend roles (see lib/roles) and are normalized
 * before comparison, so backend UPPERCASE values also work.
 */

import { normalizeRole, requiresOnboarding, type UserRole } from '../lib/roles';

export type AppRole = UserRole;

interface RoleRouteConfig {
  prefix: string;
  dashboard: string;
  login: string;
  allowedPaths: string[];
}

export const ROLE_ROUTES: Record<UserRole, RoleRouteConfig> = {
  Admin_L1: {
    prefix: '/company',
    dashboard: '/company/dashboard',
    login: '/auth/login',
    allowedPaths: ['/company'],
  },
  Admin_L2: {
    prefix: '/company',
    dashboard: '/company/dashboard',
    login: '/auth/login',
    allowedPaths: ['/company'],
  },
  Super_Admin: {
    prefix: '/admin',
    dashboard: '/admin/dashboard',
    login: '/auth/login',
    allowedPaths: ['/admin'],
  },
  Driver: {
    prefix: '/driver',
    dashboard: '/driver',
    login: '/auth/login',
    allowedPaths: ['/driver'],
  },
  Mechanic: {
    prefix: '/mechanic',
    dashboard: '/mechanic',
    login: '/auth/login',
    allowedPaths: ['/mechanic'],
  },
};

const matchesAllowedPath = (path: string, allowedPaths: string[]): boolean => {
  return allowedPaths.some(
    (allowed) => path === allowed || path.startsWith(`${allowed}/`),
  );
};

/**
 * Get the dashboard URL for a given role (accepts any role spelling).
 */
export const getDashboardByRole = (role: string | null): string => {
  const normalized = normalizeRole(role);
  if (normalized) {
    return ROLE_ROUTES[normalized].dashboard;
  }
  return '/auth/login';
};

/**
 * Get the login URL for a given role.
 */
export const getLoginByRole = (_role: string | null): string => {
  return '/auth/login';
};

/**
 * Get the login URL based on the current path.
 */
export const getLoginByPath = (_path: string): string => {
  return '/auth/login';
};

/**
 * Check if a route is allowed for a given role.
 * `/onboarding` is allowed for roles that must complete onboarding
 * (driver, mechanic) and is handled separately by ProtectedRoute.
 */
export const isRouteAllowedForRole = (
  path: string,
  role: string | null,
): boolean => {
  const normalized = normalizeRole(role);
  if (!normalized) {
    return false;
  }

  if (path === '/onboarding') {
    return requiresOnboarding(normalized);
  }

  const config = ROLE_ROUTES[normalized];
  return matchesAllowedPath(path, config.allowedPaths);
};

/**
 * Check if a path is a public/guest route (auth pages).
 */
export const isGuestRoute = (path: string): boolean => {
  return path === '/auth' || path.startsWith('/auth/');
};

/**
 * Check if a path is a protected route (requires authentication).
 */
export const isProtectedRoute = (path: string): boolean => {
  return (
    path.startsWith('/admin') ||
    path.startsWith('/super-admin') ||
    path.startsWith('/driver') ||
    path.startsWith('/mechanic') ||
    path === '/onboarding' ||
    path.startsWith('/onboarding/')
  );
};

/**
 * Get the appropriate redirect URL for an unauthorized user.
 */
export const getUnauthorizedRedirect = (
  path: string,
  isAuthenticated: boolean,
  userRole: string | null,
): string | null => {
  if (!isAuthenticated && isProtectedRoute(path)) {
    return getLoginByPath(path);
  }

  if (isAuthenticated && userRole && !isRouteAllowedForRole(path, userRole)) {
    return getDashboardByRole(userRole);
  }

  return null;
};
