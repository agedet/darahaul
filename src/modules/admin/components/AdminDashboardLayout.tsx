import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { AdminDashboardHeader } from "./AdminDashboardHeader";

type AdminDashboardLayoutProps = {
  role: "Admin_L1" | "Super_Admin" | "Admin_L2";
};

export const AdminDashboardLayout = ({ role }: AdminDashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar role={role} />
      <div className="flex flex-col flex-1">
        <AdminDashboardHeader />
        <main className="flex-1 p-6 md:p-8 lg:px-10 lg:pt-10 lg:pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}; 