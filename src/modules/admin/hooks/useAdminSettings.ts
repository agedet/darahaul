import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/providers/ApiProvider";
import endpoint from "../libs/endpoint";

// Core billing account type
export interface BillingAccount {
  id: string;
  name: string;
  type: "company" | "location";
  mode: "enterprise" | "direct";
  plan: {
    id: string;
    name: string;
    price: string;
    tokens: number;
  };
  creditBalance: number;
  dailyBurnRate: number;
  burnRateSettings: number;
  subscriptionStatus: "pending" | "active" | "canceled";
  lastActivity: string;
  nextPaymentDate: string | null;
  daysUntilExhaustion: number | null;
  companyId?: string;
  companyName?: string;
}

// API response types
export interface BillingMonitoringResponse {
  success: boolean;
  message: string;
  data: BillingAccount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalCompanies: number;
    totalLocations: number;
    totalCredits: number;
    totalDailyBurn: number;
    averageBurnRate: number;
  };
}

export interface BillingAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    totalActiveCredits: number;
    totalEntitiesWithSubscriptions: number;
    lowCreditAlert: {
      total: number;
      companies: number;
      locations: number;
      entities: Array<{
        id: string;
        name: string;
        type: "company" | "location";
        creditBalance: number;
        daysUntilExhaustion: number;
        dailyBurnRate: number;
      }>;
    };
    revenue: {
      annualSubscriptionRevenue: number;
      monthlyRecurringRevenue: number;
    };
    breakdown: {
      totalCompanies: number;
      totalLocations: number;
      averageCreditBalance: number;
    };
  };
}

export interface BillingMetricsResponse {
  success: boolean;
  message: string;
  data: BillingAccount;
}

// Transaction history types
export interface TransactionHistoryItem {
  name: string;
  amount: number;
  type: "credit" | "debit";
  previousBalance: number;
  createdAt: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  message: string;
  data: TransactionHistoryItem[];
}





// Hook parameters
export interface UseAdminSettingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  mode?: string;
  companyId?: number;
  locationId?: number;
  planName?: string;
}

// Main hooks
export const useAdminSettings = (params: UseAdminSettingsParams = {}) => {
  const api = useApi();
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    mode = "",
    companyId,
    locationId,
    planName,
  } = params;

  const queryParams = new URLSearchParams();
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());
  if (search) queryParams.append("search", search);
  if (status) queryParams.append("status", status);
  if (mode) queryParams.append("mode", mode);
  if (companyId) queryParams.append("companyId", companyId.toString());
  if (locationId) queryParams.append("locationId", locationId.toString());
  if (planName) queryParams.append("planName", planName);

  const queryString = queryParams.toString();
  const apiEndpoint = `${endpoint.billingMonitor}${
    queryString ? `?${queryString}` : ""
  }`;

  return useQuery({
    queryKey: ["adminBillingMonitoring", params],
    queryFn: async (): Promise<BillingMonitoringResponse> => {
      const response = await api.get(apiEndpoint);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!api.token,
  });
};

export const useAdminBillingAnalytics = () => {
  const api = useApi();

  return useQuery({
    queryKey: ["adminBillingAnalytics"],
    queryFn: async (): Promise<BillingAnalyticsResponse> => {
      const response = await api.get(endpoint.billingAnalytics);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!api.token,
  });
};


export const useBillingMetrics = (
  entityType: "company" | "location",
  entityId: string
) => {
  const api = useApi();

  return useQuery({
    queryKey: ["billingMetrics", entityType, entityId],
    queryFn: async (): Promise<BillingMetricsResponse> => {
      const response = await api.get(
        endpoint.billingMetrics(entityType, entityId)
      );
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
    enabled: !!api.token && !!entityId,
  });
};

export const useTransactionHistory = (
  entityType: "company" | "location",
  entityId: string
) => {
  const api = useApi();

  return useQuery({
    queryKey: ["transactionHistory", entityType, entityId],
    queryFn: async (): Promise<TransactionHistoryResponse> => {
      const response = await api.get(
        endpoint.transactionHistory(entityType, entityId)
      );
      return response;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
    enabled: !!api.token && !!entityId,
  });
};


