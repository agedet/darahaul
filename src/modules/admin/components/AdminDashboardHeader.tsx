import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";
import { ROLE_DISPLAY_NAMES } from "@/lib/roles";
import { useSearch } from "../context/SearchContext";

export const AdminDashboardHeader = () => {
  const location = useLocation();
  const { searchTerm, setSearchTerm } = useSearch();
  const { user, role } = useUserAuth();

  // Check if current page is the dashboard
  const isDashboardPage = location.pathname === "/admin/dashboard";

  // Check if current page should hide the search bar
  const shouldHideSearchBar = () => {
    // Hide on dashboard
    if (isDashboardPage) return true;

    // Hide on ReviewProductsPage: /admin/approve-products/:productId
    if (/^\/admin\/approve-products\/[^/]+$/.test(location.pathname))
      return true;

    return false;
  };

  // Get placeholder text based on current route
  const getPlaceholderText = () => {
    if (location.pathname.includes("/manage-companies")) {
      return "Search by company name, email, or company id";
    } else if (location.pathname.includes("/manage-roles")) {
      return "Search by admin name or email";
    } else if (location.pathname.includes("/approve-products")) {
      return "Search by product name or company";
    } else if (location.pathname.includes("/settings")) {
      return "Search by client name";
    }
    return "Search";
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Get user role display text
  const getRoleDisplayText = () => {
    if (!role) return "";
    return ROLE_DISPLAY_NAMES[role] ?? role;
  };

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between gap-4 border-b bg-destructive-foreground px-6 py-10 mb-3">
      {!shouldHideSearchBar() ? (
        <div className="relative flex-1 items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={getPlaceholderText()}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full max-w-md bg-background pl-10 py-4 rounded-md text-muted-foreground text-2xl h-auto"
          />
        </div>
      ) : (
        <div className="flex-1"></div>
      )}
      {/* {!isDashboardPage && (
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.userProfileImage} alt="User profile" />
          <AvatarFallback className="bg-muted">
            <CircleUser className="h-6 w-6 text-foreground" />
          </AvatarFallback>
        </Avatar>
      )} */}
      <div className="ml-auto">
        <p className="text-sm text-muted-foreground">{getRoleDisplayText()}</p>
      </div>
    </header>
  );
};