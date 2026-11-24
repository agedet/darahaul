import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

type DashboardLayoutProps = {
  role?: string;
};

export const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar role={role} />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="flex-1 p-6 md:p-8 lg:px-10 lg:pt-10 lg:pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
