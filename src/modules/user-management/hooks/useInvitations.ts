import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Api from "@/utils/api";

export interface Invitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: string;
  status: string;
  expires_at: string;
  invited_by: string;
  inviter_name?: string;
  created_at: string;
  accepted_at?: string | null;
}

export interface CreateInvitationPayload {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number?: string;
}

const ADMIN_INVITE_ROLES = ["Super_Admin", "Admin_L1", "Admin_L2"];

const invitationsKeys = {
  all: ["invitations"] as const,
  list: () => [...invitationsKeys.all, "list"] as const,
};

export const useInvitations = () => {
  return useQuery({
    queryKey: invitationsKeys.list(),
    queryFn: () => Api.get<Invitation[]>("/invitations"),
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInvitationPayload) => {
      // Admin roles go through the super-admin endpoint; team roles
      // (Admin_L2, Mechanic, Driver) go through the general endpoint.
      const url = ADMIN_INVITE_ROLES.includes(payload.role)
        ? "/admin/invitations"
        : "/invitations";
      return Api.post<Invitation>(url, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationsKeys.all });
    },
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      Api.delete<{ message: string }>(`/invitations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationsKeys.all });
    },
  });
};

export const useResendInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      Api.post<Invitation>(`/invitations/${id}/resend`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationsKeys.all });
    },
  });
};
