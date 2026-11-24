import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Api from "@/utils/api";

export interface ManagedUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at?: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  role?: string;
}

const usersKeys = {
  all: ["users"] as const,
  list: () => [...usersKeys.all, "list"] as const,
};

export const useUsers = () => {
  return useQuery({
    queryKey: usersKeys.list(),
    queryFn: () => Api.get<ManagedUser[]>("/users"),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      Api.patch<ManagedUser>(`/users/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => Api.delete<{ message: string }>(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
};
