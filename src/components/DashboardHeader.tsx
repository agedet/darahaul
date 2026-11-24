import { CircleUser } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";
import { normalizeRole } from "@/lib/roles";
import { roleDisplayNames } from "@/lib/navigation.config";

export const DashboardHeader = () => {
  const { user, role } = useUserAuth();
  const normalizedRole = normalizeRole(role);

  const getRoleDisplayText = () => {
    if (normalizedRole) {
      return roleDisplayNames[normalizedRole];
    }
    return user?.role ?? "";
  };

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between gap-4 border-b bg-destructive-foreground px-6 py-10 mb-4">
      <div className="flex-1" />
      <p className="text-sm text-muted-foreground">{getRoleDisplayText()}</p>
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-muted">
          <CircleUser className="h-6 w-6 text-foreground" />
        </AvatarFallback>
      </Avatar>
    </header>
  );
};
