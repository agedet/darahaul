import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/providers/ApiProvider";
import type {
  ApiVehiclesResponse,
  VehiclesQueryParams,
  ApiVehicle,
} from "@/lib/types";
import endpoint from "../libs/endpoint";
import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";

// Transform API vehicle data to match the expected Vehicle interface
const transformVehicleData = (apiVehicle: ApiVehicle) => {
  // Format date
  let date = "N/A";
  if (apiVehicle.created_at && typeof apiVehicle.created_at === "string") {
    const parsedDate = new Date(apiVehicle.created_at);
    if (!isNaN(parsedDate.getTime())) {
      date = parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // Capitalize status
  let status = "N/A";
  if (apiVehicle.status && typeof apiVehicle.status === "string") {
    status =
      apiVehicle.status.charAt(0).toUpperCase() + apiVehicle.status.slice(1);
  }

  // Get admin name from company contact info
  let admin = "N/A";
  if (apiVehicle.company) {
    if (
      apiVehicle.company.main_contact_first_name &&
      apiVehicle.company.main_contact_last_name
    ) {
      admin = `${apiVehicle.company.main_contact_first_name} ${apiVehicle.company.main_contact_last_name}`;
    } else if (
      apiVehicle.company.main_contact_first_name ||
      apiVehicle.company.main_contact_last_name
    ) {
      admin =
        apiVehicle.company.main_contact_first_name ||
        apiVehicle.company.main_contact_last_name ||
        "N/A";
    } else if (apiVehicle.company.company_email) {
      const emailUser = apiVehicle.company.company_email.split("@")[0];
      admin = emailUser.charAt(0).toUpperCase() + emailUser.slice(1);
    }
  }

  return {
    id: apiVehicle.id || "N/A",
    name: apiVehicle.vehicle || "N/A",
    company: apiVehicle.company?.company_name || "N/A",
    admin: admin,
    status: status,
    date: date,
  };
};

export const useVehicles = () => {
  const api = useApi();
  const { user } = useUserAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchVehicles = useCallback(
    async (params: VehiclesQueryParams = {}) => {
      if (!user?.id) {
        setError("User not authenticated");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Build query string
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);

        const queryString = queryParams.toString();
        const url = `${endpoint.vehicles}${
          queryString ? `?${queryString}` : ""
        }`;

        const response: ApiVehiclesResponse = await api.get(url);

        // Transform the data
        const transformedVehicles = response.data.map(transformVehicleData);

        setVehicles(transformedVehicles);
        setPagination(response.pagination);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        console.error("Error details:", {
          message: err instanceof Error ? err.message : "Unknown error",
          user: user?.id,
          url: `${endpoint.vehicles}`,
        });
        setError(
          err instanceof Error ? err.message : "Failed to fetch vehicles"
        );
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const refetch = useCallback(() => {
    fetchVehicles({ page: pagination.page, limit: pagination.limit });
  }, [fetchVehicles, pagination.page, pagination.limit]);

  const setPage = useCallback(
    (page: number) => {
      fetchVehicles({ page, limit: pagination.limit });
    },
    [fetchVehicles, pagination.limit]
  );

  const setLimit = useCallback(
    (limit: number) => {
      fetchVehicles({ page: 1, limit });
    },
    [fetchVehicles]
  );

  const search = useCallback(
    (searchTerm: string) => {
      fetchVehicles({ page: 1, limit: pagination.limit, search: searchTerm });
    },
    [fetchVehicles, pagination.limit]
  );

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchVehicles({ page: 1, limit: 20 });
    }
  }, [user?.id, fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    pagination,
    refetch,
    setPage,
    setLimit,
    search,
    fetchVehicles,
  };
};