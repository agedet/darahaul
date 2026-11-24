import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";
import { roleDisplayNames } from "@/lib/navigation.config";

const DriverDashboard = () => {
  const { user, role } = useUserAuth();

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold text-gray-950">Dashboard</h1>
      <p className="text-sm text-gray-600">
        Welcome back{user?.firstName ? `, ${user.firstName}` : ""}. You are
        signed in as {role ? roleDisplayNames[role] : "Driver"}.
      </p>
    </section>
  );
};

export default DriverDashboard;
