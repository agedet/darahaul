import { useState } from "react";
import { useApi } from "@/providers/ApiProvider";

interface InviteMemberData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  branchNames: string[];
}

interface InviteMemberResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId: number;
    branchNames: string[];
    status: string;
  };
}

export const useAdminInviteMember = () => {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteMember = async (
    companyId: string,
    data: InviteMemberData
  ): Promise<InviteMemberResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const url = `/admin/companies/${companyId}/invite-member`;

      const response: InviteMemberResponse = await api.post(url, data);

      return response;
    } catch (err) {
      console.error("Error inviting member:", err);
      setError(err instanceof Error ? err.message : "Failed to invite member");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    inviteMember,
    loading,
    error,
  };
};