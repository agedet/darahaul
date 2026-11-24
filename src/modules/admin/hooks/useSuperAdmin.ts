import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/providers/ApiProvider";
import endpoint from "../libs/endpoint";

export interface SuperAdmin {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  status: string;
  created_at: any;
  updated_at: any;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
}

export interface SuperAdminResponse {
  data: SuperAdmin[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SuperAdminFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}

export interface CreateSuperAdminData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

export interface UpdateSuperAdminData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface CreateSuperAdminResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    status: string;
    created_at: string;
    invited_by: string;
  };
}

// Query keys factory
const superAdminKeys = {
  all: ['superAdmins'] as const,
  lists: () => [...superAdminKeys.all, 'list'] as const,
  list: (filters: SuperAdminFilters) => [...superAdminKeys.lists(), filters] as const,
};

// API functions
const createSuperAdminApi = async (
  api: any,
      adminData: CreateSuperAdminData
    ): Promise<CreateSuperAdminResponse> => {
        const requestData = {
          email: adminData.email,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          role: adminData.role,
          status: adminData.status,
        };

  return await api.post(`${endpoint.admin}/auth/invite-super-admin`, requestData);
};

const updateSuperAdminApi = async (
  api: any,
  adminId: string,
  adminData: UpdateSuperAdminData
): Promise<void> => {
  const requestData = {
    email: adminData.email,
    firstName: adminData.firstName,
    lastName: adminData.lastName,
    role: adminData.role,
  };

  await api.patch(`${endpoint.admin}/super-admins/${adminId}`, requestData);
};

const deleteSuperAdminApi = async (api: any, adminId: string): Promise<void> => {
  await api.delete(`${endpoint.admin}/super-admins/${adminId}`);
};

const fetchSuperAdminsApi = async (
  api: any,
  filters: SuperAdminFilters
): Promise<SuperAdminResponse> => {
  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.search) params.append("search", filters.search);
  if (filters.status && filters.status !== "all") {
    params.append("status", filters.status);
  }
  if (filters.role && filters.role !== "all") {
    params.append("role", filters.role);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${endpoint.admin}/super-admins?${queryString}`
    : `${endpoint.admin}/super-admins`;


  return await api.get(url);
};

export const useSuperAdmins = (initialFilters: SuperAdminFilters = {}) => {
  const api = useApi();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<SuperAdminFilters>({
    page: 1,
    limit: 20,
    ...initialFilters,
  });

  // Query for fetching super admins
  const {
    data: superAdminResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: superAdminKeys.list(filters),
    queryFn: () => fetchSuperAdminsApi(api, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const superAdmins = superAdminResponse?.data || [];
  const pagination = superAdminResponse?.pagination || null;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (adminData: CreateSuperAdminData) =>
      createSuperAdminApi(api, adminData),
    onSuccess: () => {
      // Invalidate and refetch super admins queries
      queryClient.invalidateQueries({ queryKey: superAdminKeys.all });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ adminId, adminData }: { adminId: string; adminData: UpdateSuperAdminData }) =>
      updateSuperAdminApi(api, adminId, adminData),
    onSuccess: () => {
      // Invalidate and refetch super admins queries
      queryClient.invalidateQueries({ queryKey: superAdminKeys.all });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (adminId: string) => deleteSuperAdminApi(api, adminId),
    onSuccess: () => {
      // Invalidate and refetch super admins queries
      queryClient.invalidateQueries({ queryKey: superAdminKeys.all });
    },
  });

  // Filter update functions
  const updateFilters = useCallback(
    (newFilters: Partial<SuperAdminFilters>) => {
      setFilters((prev) => {
        const updatedFilters = {
          ...prev,
          ...newFilters,
          // Only reset page to 1 if we're changing search, status, or role filters
          // But NOT if we're explicitly setting a page number
          page:
            newFilters.page !== undefined
              ? newFilters.page
              : newFilters.search !== undefined ||
                newFilters.status !== undefined ||
                newFilters.role !== undefined
              ? 1
              : prev.page,
        };
        return updatedFilters;
      });
    },
    []
  );

  const goToPage = useCallback(
    (page: number) => {
      updateFilters({ page });
    },
    [updateFilters]
  );

  const searchSuperAdmins = useCallback(
    (searchTerm: string) => {
      updateFilters({ search: searchTerm });
    },
    [updateFilters]
  );

  const filterByStatus = useCallback(
    (status: string) => {
      updateFilters({ status });
    },
    [updateFilters]
  );

  const filterByRole = useCallback(
    (role: string) => {
      updateFilters({ role });
    },
    [updateFilters]
  );

  const setLimit = useCallback(
    (limit: number) => {
      updateFilters({ limit });
    },
    [updateFilters]
  );

  // Wrapper functions for mutations
  const createSuperAdmin = useCallback(
    async (adminData: CreateSuperAdminData): Promise<CreateSuperAdminResponse> => {
      return await createMutation.mutateAsync(adminData);
    },
    [createMutation]
  );

  const updateSuperAdmin = useCallback(
    async (adminId: string, adminData: UpdateSuperAdminData): Promise<void> => {
      return await updateMutation.mutateAsync({ adminId, adminData });
    },
    [updateMutation]
  );

  const deleteSuperAdmin = useCallback(
    async (adminId: string): Promise<void> => {
      return await deleteMutation.mutateAsync(adminId);
    },
    [deleteMutation]
  );

  return {
    superAdmins,
    pagination,
    loading,
    error: error?.message || null,
    deleting: deleteMutation.isPending,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    filters,
    updateFilters,
    goToPage,
    setLimit,
    searchSuperAdmins,
    filterByStatus,
    filterByRole,
    createSuperAdmin,
    updateSuperAdmin,
    deleteSuperAdmin,
    refetch,
  };
};