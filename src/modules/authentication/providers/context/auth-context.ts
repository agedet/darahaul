import { createContext } from 'react';
import type { UserProfile } from '../../../../services/user';
import type { UserRole } from '../../../../lib/roles';

export interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refetchUser: () => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
