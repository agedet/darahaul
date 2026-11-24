import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";
import { useMemo } from "react";

export const usePermissions = () => {
  const { role } = useUserAuth();

  // useMemo ensures this object is not recalculated on every render
  const permissions = useMemo(() => ({
    // Only Permissions (Full Access)
    canManageSuperAdminRoles: role === 'Super_Admin',

    // Super Admin Permissions
    canApproveVehicles: role === 'Super_Admin',
    canReviewApproveVehicles: role === 'Super_Admin',

    // Fleet Permissions — super_admin and admin_L1 manage the company fleet
    canAddEditVehicles: role === 'Super_Admin' || role === 'Admin_L1',
    canAddEditCategories: role === 'Super_Admin' || role === 'Admin_L1',
    canViewAssignedUsers: role === 'Super_Admin' || role === 'Admin_L1',
    canSupportOnboarding: role === 'Super_Admin' || role === 'Admin_L1',

    // L2 Permissions (View Only)
    canViewOnly: role === 'Admin_L2',

    // Helper functions for common permission checks
    isL1Admin: role === 'Admin_L1',
    isL2Admin: role === 'Admin_L2',
    isSuperAdmin: role === 'Super_Admin',
  }), [role]);

  return permissions;
};
