/**
 * Types for the DaraHaul cookie-based auth API (darahaul-api).
 *
 * The backend authenticates via HttpOnly cookies (`accessToken` +
 * `refreshToken`) set by POST /auth/verify-otp. No tokens are stored
 * or sent by the client.
 */

export interface IAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Raw backend role, e.g. "DRIVER", "MECHANIC", "ADMIN_L1". Normalize via lib/roles. */
  role: string;
}

export interface IDriverProfile {
  licenseNumber?: string | null;
  address?: string | null;
  emergencyPhone?: string | null;
  dateOfBirth?: string | null;
  emergencyContactName?: string | null;
}

export interface IMechanicProfile {
  specialty?: string | null;
  certifications?: string | null;
  yearsOfExperience?: number | null;
  hourlyRate?: number | string | null;
}

/** Response of GET /auth/session — the authenticated user's session payload. */
export interface IAuthSession extends IAuthUser {
  phoneNumber?: string;
  /** True when the role-specific onboarding requirements are fulfilled. */
  onboardingCompleted: boolean;
  driver: IDriverProfile | null;
  mechanic: IMechanicProfile | null;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ILoginResponse {
  message: string;
  /** Present so the client can route to OTP verification. */
  user: { email: string };
}

export interface IRegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  country: string;
  state: string;
  date_of_birth: string;
  terms_accepted: boolean;
}

export interface IRegisterResponse {
  message: string;
  user: { email: string };
}

export interface IVerifyOtpPayload {
  email: string;
  otp: string;
}

export interface IVerifyOtpResponse {
  message: string;
  user: IAuthUser;
}

export interface IResendOtpResponse {
  message: string;
  user: { email: string };
}

export interface IForgotPasswordResponse {
  message: string;
}

export interface IResetPasswordPayload {
  newPassword: string;
  confirmNewPassword: string;
}

export interface IResetPasswordResponse {
  message: string;
}

export interface IDriverOnboardingPayload {
  license_number?: string;
  address?: string;
  emergency_phone?: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
}

export interface IMechanicOnboardingPayload {
  specialty?: string;
  certifications?: string;
  years_of_experience?: number;
  hourly_rate?: number;
}

export interface ICompleteOnboardingPayload {
  driver_onboarding?: IDriverOnboardingPayload;
  mechanic_onboarding?: IMechanicOnboardingPayload;
}
