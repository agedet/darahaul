import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/providers/ApiProvider";
import endpoint from "../libs/endpoint";

// Admin Dashboard API Types
export interface ApiActivity {
  id: string;
  created_at: string;
  completed: boolean;
  channel: string;
  user_info: {
    name: string;
  };
}

export interface ApiUsageData {
  month: string;
  totalCost: number;
}

export interface AdminDashboardResponse {
  activities: {
    activities: ApiActivity[];
    totalActivities: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  usageData: {
    data: ApiUsageData[];
    period: string;
    count: number;
    dataType: string;
  };
  counts: {
    totalCompanies: number;
    totalBranches: number;
    totalProducts: number;
    pendingProducts: number;
  };
  userProfile: {
    firstName: string;
    profileImage: string;
  };
}

interface UseAdminDashboardParams {
  period?: string;
}

export const useAdminDashboard = ({ period = "monthly" }: UseAdminDashboardParams = {}) => {
  const api = useApi();

  return useQuery({
    queryKey: ["adminDashboard", period],
    queryFn: async (): Promise<AdminDashboardResponse> => {
      const response = await api.get(endpoint.dashboard(period));
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!api.token, // Only run query when token is available
  });
};