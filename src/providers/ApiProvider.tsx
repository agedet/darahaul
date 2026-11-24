import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

interface ApiContextType {
  token: string | null;
  updateToken: (newToken: string | null) => void;
}

const ApiContext = createContext<ApiContextType | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const updateToken = useCallback((newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem("authToken", newToken);
    } else {
      localStorage.removeItem("authToken");
    }
  }, []);

  if (loading) {
    return null;
  }

  return (
    <ApiContext.Provider value={{ token, updateToken }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }

  const { token, updateToken } = context;

  const request = useCallback(
    async (
      method: string,
      endpoint: string,
      data?: any,
      isForm: boolean = false
    ) => {
      const url = `${API_BASE_URL}${endpoint}`;
      const headers: Record<string, string> = {
        "ngrok-skip-browser-warning": "true",
      };

      // Add cache-busting headers for GET requests to prevent stale data
      if (method === "GET") {
        headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        headers["Pragma"] = "no-cache";
        headers["Expires"] = "0";
      }

      if (isForm) {
        headers["Accept"] = "*/*";
      } else {
        headers["Content-Type"] = "application/json";
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }


      try {
        const response = await fetch(url, {
          method,
          headers,
          body: isForm ? data : data ? JSON.stringify(data) : undefined,
        });

        let result: any = null;
        const text = await response.text();

        if (text) {
          try {
            result = JSON.parse(text);
          } catch {
            result = text; // fallback if not JSON
          }
        }

        if (!response.ok) {
          // Handle 403 Forbidden errors with user-friendly message
          if (response.status === 403) {
            const forbiddenError =
              "You do not have permission to perform this action.";
            console.error("Permission Denied (403):", { url, method });
            // Import toast dynamically to avoid circular dependencies
            import("sonner").then(({ toast }) => {
              toast.error(forbiddenError);
            });
            throw new Error(forbiddenError);
          }

          // If unauthorized, clear the token and "log out"
          if (response.status === 401) {
            console.warn("Session expired or unauthorized. Logging out.");
            updateToken(null);

            // Clear onboarding data on session expiry
            const onboardingKeys = [
            //   "onboarding_selectedPlan",
              "agreement_completed",
              "company_setup_completed",
              "onboarding_driverData",
              "onboarding_mechanicData",
            //   "onboarding_paymentType",
            ];
            onboardingKeys.forEach((key) => localStorage.removeItem(key));
          }

          const errorMessage =
            result?.message ||
            result?.error ||
            `Request failed with status ${response.status}`;

          console.error("API Error Details:", {
            status: response.status,
            statusText: response.statusText,
            url,
            method,
            result,
          });

          throw new Error(errorMessage);
        }

        return result;
      } catch (error) {
        console.error("API Error:", error);
        console.error("Request Details:", {
          url,
          method,
          headers,
          data: isForm ? "FormData" : data,
        });
        throw error;
      }
    },
    [token, updateToken]
  );

  const api = useMemo(
    () => ({
      token,
      updateToken,
      get: (endpoint: string) => request("GET", endpoint),
      post: (endpoint: string, data: any) => request("POST", endpoint, data),
      put: (endpoint: string, data: any) => request("PUT", endpoint, data),
      patch: (endpoint: string, data: any) => request("PATCH", endpoint, data),
      patchForm: (endpoint: string, data: FormData) =>
        request("PATCH", endpoint, data, true),
      delete: (endpoint: string, data?: any) =>
        request("DELETE", endpoint, data),
      upload: (endpoint: string, data: FormData) =>
        request("POST", endpoint, data, true),
    }),
    [token, updateToken, request]
  );

  return api;
};