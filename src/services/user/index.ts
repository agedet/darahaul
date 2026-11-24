import Api from "../../utils/api";
import AuthService from "../auth";
import type {
  IAuthSession,
  ICompleteOnboardingPayload,
} from "../auth/types";

export type UserProfile = IAuthSession;

export interface UpdatePersonalProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  country?: string;
  state?: string;
  date_of_birth?: string;
}

export interface CompleteOnboardingResponse {
  message: string;
  onboardingCompleted: boolean;
}

class UserService {
  private static PROFILE_URL = "/profile";

  /** GET /auth/session — current user incl. role profile + onboarding status. */
  public static async getProfile(): Promise<UserProfile> {
    return AuthService.getSession();
  }

  /** PATCH /profile/personal — update personal profile fields. */
  public static async updateProfile(
    payload: UpdatePersonalProfilePayload,
  ): Promise<UserProfile> {
    return Api.patch<UserProfile>(`${this.PROFILE_URL}/personal`, payload);
  }

  /**
   * POST /profile/onboarding — create/update driver or mechanic
   * role requirements. The backend selects the profile by the
   * authenticated user's role.
   */
  public static async completeOnboarding(
    payload: ICompleteOnboardingPayload,
  ): Promise<CompleteOnboardingResponse> {
    return Api.post<CompleteOnboardingResponse>(
      `${this.PROFILE_URL}/onboarding`,
      payload,
    );
  }
}

export default UserService;
