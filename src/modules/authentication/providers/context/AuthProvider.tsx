import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import UserService from '../../../../services/user';
import AuthService from '../../../../services/auth';
import { normalizeRole } from '../../../../lib/roles';
import { AuthContext, type AuthContextType } from './auth-context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const {
    data: user,
    isLoading: isQueryLoading,
    refetch: refetchUser,
    isError,
  } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () => UserService.getProfile(),
    staleTime: 30000,
    retry: false,
  });

  const role = normalizeRole(user?.role);
  const permissions: string[] = [];
  const isAuthenticated = !!user && !isError;
  const isLoading = isQueryLoading;

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((p) => permissions.includes(p));
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // Cookies are cleared server-side; ignore network failures.
    } finally {
      queryClient.clear();
      window.location.href = '/auth/login';
    }
  };

  const value: AuthContextType = {
    user: user || null,
    role,
    permissions,
    isAuthenticated,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetchUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
