import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";

export interface DriverProfile {
  id: string;
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  phoneNumber: string;
  licenseNumber?: string | null;
  address?: string | null;
  emergencyPhone?: string | null;
  emergencyContactName?: string | null;
}

/**
 * Driver profile derived from the authenticated session
 * (GET /auth/session via the auth context). No separate endpoint exists.
 */
export const useDriverProfile = () => {
  const { user, isLoading } = useUserAuth();

  const profile: DriverProfile | null = user
    ? {
        id: user.id,
        companyName: "",
        email: user.email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        jobTitle: "",
        phoneNumber: user.phoneNumber ?? "",
        licenseNumber: user.driver?.licenseNumber ?? null,
        address: user.driver?.address ?? null,
        emergencyPhone: user.driver?.emergencyPhone ?? null,
        emergencyContactName: user.driver?.emergencyContactName ?? null,
      }
    : null;

  return {
    profile,
    loading: isLoading,
    error: null as string | null,
    refetch: () => {},
  };
};
