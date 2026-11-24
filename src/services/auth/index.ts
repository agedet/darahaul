import { authAxiosInstance } from "../../utils/api";
import type {
  IAuthSession,
  IForgotPasswordResponse,
  ILoginPayload,
  ILoginResponse,
  IRegisterPayload,
  IRegisterResponse,
  IResendOtpResponse,
  IResetPasswordPayload,
  IResetPasswordResponse,
  IVerifyOtpPayload,
  IVerifyOtpResponse,
} from "./types";

const AUTH_API_BASE = "/auth";

/**
 * Auth service for the cookie-based DaraHaul API.
 *
 * All authenticated requests rely on the HttpOnly `accessToken` cookie
 * set by POST /auth/verify-otp — no tokens are handled by the client.
 */
class AuthService {
  /** POST /auth/register — creates a DRIVER account and emails an OTP. */
  public static async register(payload: IRegisterPayload) {
    const { data } = await authAxiosInstance.post<IRegisterResponse>(
      `${AUTH_API_BASE}/register`,
      payload,
    );
    return data;
  }

  /** POST /auth/login — validates credentials and emails a login OTP. */
  public static async login(payload: ILoginPayload) {
    const { data } = await authAxiosInstance.post<ILoginResponse>(
      `${AUTH_API_BASE}/login`,
      payload,
    );
    return data;
  }

  /**
   * POST /auth/verify-otp — verifies the emailed OTP and sets the
   * HttpOnly auth cookies. Returns the user payload.
   */
  public static async verifyOtp(payload: IVerifyOtpPayload) {
    const { data } = await authAxiosInstance.post<IVerifyOtpResponse>(
      `${AUTH_API_BASE}/verify-otp`,
      payload,
    );
    return data;
  }

  /** POST /auth/resend-otp/:email — resends the OTP email. */
  public static async resendOtp(email: string) {
    const { data } = await authAxiosInstance.post<IResendOtpResponse>(
      `${AUTH_API_BASE}/resend-otp/${encodeURIComponent(email)}`,
    );
    return data;
  }

  /** POST /auth/forgot-password — emails a password reset OTP. */
  public static async forgotPassword(email: string) {
    const { data } = await authAxiosInstance.post<IForgotPasswordResponse>(
      `${AUTH_API_BASE}/forgot-password`,
      { email },
    );
    return data;
  }

  /**
   * POST /auth/reset-password — changes the password for the
   * authenticated user (requires a valid session cookie).
   */
  public static async resetPassword(payload: IResetPasswordPayload) {
    const { data } = await authAxiosInstance.post<IResetPasswordResponse>(
      `${AUTH_API_BASE}/reset-password`,
      payload,
    );
    return data;
  }

  /** GET /auth/session — current user + onboarding status (cookie auth). */
  public static async getSession() {
    const { data } = await authAxiosInstance.get<IAuthSession>(
      `${AUTH_API_BASE}/session`,
    );
    return data;
  }

  /** POST /auth/logout — clears the auth cookies server-side. */
  public static async logout() {
    const { data } = await authAxiosInstance.post<{ message: string }>(
      `${AUTH_API_BASE}/logout`,
    );
    return data;
  }

  /**
   * POST /auth/refresh — exchanges the refresh-token cookie for a new
   * access-token cookie. Used by the axios 401 interceptor.
   */
  public static async refreshToken() {
    const { data } = await authAxiosInstance.post<{ message: string }>(
      `${AUTH_API_BASE}/refresh`,
      {},
      { withCredentials: true },
    );
    return data;
  }
}

export default AuthService;
