import { Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
// import { CreateProductPage } from "./pages/dashboard/products/CreateProductPage";
// import { EditProductPage } from "./pages/dashboard/products/EditProductPage";
// import { ProductsPage } from "./pages/dashboard/products/ProductsPage";
// import CompanyOnboarding from "./pages/onboarding/OnboardingIndex";
// import CompanySettingsPage from "./pages/dashboard/settings/CompanySettingsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import VehiclesPage from "@/modules/fleet/pages/VehiclesPage";
import VehicleFormPage from "@/modules/fleet/pages/VehicleFormPage";
import UserManagementPage from "@/modules/user-management/UserManagementPage";
// import { useEffect } from "react";
// import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
// import { OnboardingProvider } from "./pages/onboarding/context/OnboardingContext";
// import { useOnboardingStatus } from "./hooks/useOnboardingStatus";
// import { SearchProvider } from "./context/SearchContext";

// Component to check onboarding status and route accordingly
// const OnboardingCheck = ({ children }: { children: React.ReactNode }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { status, loading, error, hasNoCompany } = useOnboardingStatus();

//   useEffect(() => {
//     // Skip checking if we're already on onboarding routes
//     if (
//       location.pathname.startsWith("/company/onboarding") ||
//       location.pathname.startsWith("/company/billing")
//     ) {
//       return;
//     }

//     // If still loading, wait
//     if (loading) {
//       return;
//     }

//     // If user has no company, redirect to onboarding
//     if (hasNoCompany) {
//       navigate("/company/onboarding");
//       return;
//     }

//     // If there's an error, we'll still allow access to dashboard
//     // but log the error for debugging
//     if (error) {
//       console.error("Error checking onboarding status:", error);
//     }

//     // Check if onboarding is complete based on API response
//     if (status?.isOnboardingComplete) {
//       // Onboarding is complete, allow access to dashboard
//       // If we're on the root company path, redirect to dashboard
//       if (location.pathname === "/company") {
//         navigate("/company/dashboard");
//       }
//     } else {
//       // Onboarding is not complete, redirect to onboarding
//       navigate("/company/onboarding");
//     }
//   }, [status, loading, error, hasNoCompany, navigate, location.pathname]);

//   // Show loading state while checking onboarding status
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
//         </div>
//       </div>
//     );
//   }

//   // If there's an error, still allow access but show a warning
//   if (error) {
//     console.warn(
//       "Onboarding status check failed, allowing dashboard access:",
//       error
//     );
//   }

//   return <>{children}</>;
// };

const CompanyIndex = () => {
  return (
    // <SearchProvider>
    //   <OnboardingProvider>
        <Routes>
          {/* All routes inside this element will have the DashboardLayout */}
          <Route
            element={
            //   <OnboardingCheck>
                <DashboardLayout role="Admin_L1" />
            //   </OnboardingCheck>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="fleet" element={<VehiclesPage />} />
            <Route path="fleet/new" element={<VehicleFormPage />} />
            <Route path="fleet/:vehicleId/edit" element={<VehicleFormPage />} />
            <Route path="user-management" element={<UserManagementPage />} />
            
            {/* <Route path="products" element={<ProductsPage />} /> */}
            {/* <Route path="products/create" element={<CreateProductPage />} /> */}
            {/* <Route path="products/edit/:productId" element={<EditProductPage />} /> */}
            
            {/* <Route path="settings" element={<CompanySettingsPage />} /> */}
          </Route>

          {/* The onboarding route does NOT use the DashboardLayout */}
          {/* <Route path="onboarding/*" element={<CompanyOnboarding />} /> */}
        </Routes>
    //   {/* </OnboardingProvider> */}
    // </SearchProvider>
  );
};

export default CompanyIndex;