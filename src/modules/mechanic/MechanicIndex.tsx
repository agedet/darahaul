import { Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";

const MechanicIndex = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default MechanicIndex;
