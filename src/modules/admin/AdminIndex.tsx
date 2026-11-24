import { Navigate, Route, Routes } from "react-router-dom";
import ApproveVehiclesPage from "./pages/ApproveVehiclesPage";
import { AdminDashboardLayout } from "./components/AdminDashboardLayout";
import ReviewVehiclesPage from "./pages/ReviewVehiclesPage";
import EditVehiclePage from "./pages/EditVehiclePage";
import { SearchProvider } from "./context/SearchContext";
import { ManageRolesPage } from "./pages/ManageRoles";
import { AdminSettingsPage } from "./pages/settings/AdminSettingsPage";
import AdminDashboard from "./pages/dashboard/DashboardPage";
import VehiclesPage from "@/modules/fleet/pages/VehiclesPage";
import VehicleFormPage from "@/modules/fleet/pages/VehicleFormPage";
import UserManagementPage from "@/modules/user-management/UserManagementPage";

const AdminIndex = () => {
  return (
    <SearchProvider>
      <Routes>
        {/* All routes inside this element will have the DashboardLayout */}
        <Route element={<AdminDashboardLayout role="Super_Admin" />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="fleet" element={<VehiclesPage />} />
          <Route path="fleet/new" element={<VehicleFormPage />} />
          <Route path="fleet/:vehicleId/edit" element={<VehicleFormPage />} />
          
          <Route
            path="manage-companies/edit-vehicle/:vehicleId"
            element={<EditVehiclePage />}
          />
          <Route path="manage-roles" element={<ManageRolesPage />} />
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="approve-vehicles" element={<ApproveVehiclesPage />} />
          <Route
            path="approve-vehicles/:vehicleId"
            element={<ReviewVehiclesPage />}
          />
          <Route path="edit-vehicle/:vehicleId" element={<EditVehiclePage />} />
        </Route>
      </Routes>
    </SearchProvider>
  );
};

export default AdminIndex;