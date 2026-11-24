import { useState, useEffect } from "react";
import { useApi } from "@/providers/ApiProvider";
import endpoint from "../libs/endpoint";
import type { VehicleCategory } from "@/lib/types";

interface SelectOption {
  value: string;
  label: string;
}

export const useVehicleCategories = (companyId: string | undefined) => {
  const api = useApi();
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!companyId) {
        setCategories([{ value: "none", label: "No categories available" }]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Use admin endpoint for company categories
        const endpointUrl = endpoint.adminCompanyCategories(companyId);

        const response = await api.get(endpointUrl);
        
        // Extract categories from response - handle both array and object responses
        let categoriesData;
        if (Array.isArray(response)) {
          categoriesData = response;
        } else if (Array.isArray(response?.data)) {
          categoriesData = response.data;
        } else {
          categoriesData = response?.data?.categories || response?.categories || [];
        }
        
        // Transform to select options
        let options: SelectOption[];
        if (categoriesData.length === 0) {
          options = [{ value: "none", label: "No categories available" }];
        } else {
          options = categoriesData.map((category: VehicleCategory) => ({
            value: category.id.toString(),
            label: category.category,
          }));
        }
        
        setCategories(options);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch categories");
        setCategories([{ value: "none", label: "No categories available" }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [companyId, api]);

  return { categories, isLoading, error };
};
