import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";

export interface MechanicProfile {
  id: string;
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  specialization: string;
  phoneNumber: string;
  certifications?: string | null;
  yearsOfExperience?: number | null;
  hourlyRate?: number | string | null;
}

/**
 * Mechanic profile derived from the authenticated session
 * (GET /auth/session via the auth context). No separate endpoint exists.
 */
export const useMechanicProfile = () => {
  const { user, isLoading } = useUserAuth();

  const profile: MechanicProfile | null = user
    ? {
        id: user.id,
        companyName: "",
        email: user.email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        jobTitle: "",
        specialization: user.mechanic?.specialty ?? "",
        phoneNumber: user.phoneNumber ?? "",
        certifications: user.mechanic?.certifications ?? null,
        yearsOfExperience: user.mechanic?.yearsOfExperience ?? null,
        hourlyRate: user.mechanic?.hourlyRate ?? null,
      }
    : null;

  return {
    profile,
    loading: isLoading,
    error: null as string | null,
    refetch: () => {},
  };
};
