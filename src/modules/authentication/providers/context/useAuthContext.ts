import { useContext } from 'react';
import { AuthContext, type AuthContextType } from './auth-context';

export const useUserAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within an AuthProvider');
  }
  return context;
};
