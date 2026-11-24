import { Navigate } from 'react-router-dom';
import { useUserAuth } from '@/modules/authentication/providers/context/useAuthContext';
import { getDashboardByRole } from '@/utils/routeConfig';

export function AdminIndexRedirect() {
  const { role } = useUserAuth();
  return <Navigate to={getDashboardByRole(role)} replace />;
}
