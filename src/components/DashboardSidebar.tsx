import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { navLinksMap, roleDisplayNames } from "@/lib/navigation.config";
import logoSrc from "@/assets/darahaul-logo-icon-white.png";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  PanelRightClose,
  PanelRightOpen,
  X,
  Info,
  CircleUser,
} from "lucide-react";
import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { normalizeRole } from "@/lib/roles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DashboardSidebarProps = {
  role?: string;
};

export const DashboardSidebar = ({ role: roleProp }: DashboardSidebarProps) => {
  const { user, role: authRole, logout } = useUserAuth();
  const role = normalizeRole(roleProp ?? authRole);
  const allNavigationLinks = role ? navLinksMap[role] : [];
  const permissions = usePermissions();

  // State for sidebar collapse/expand - initialize from localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isHovered, setIsHovered] = useState(false);

  // State for logout confirmation modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Filter navigation links based on permissions
  const navigationLinks = allNavigationLinks.filter((link) => {
    if (!link.permission) return true;
    return permissions[link.permission as keyof typeof permissions] === true;
  });

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const userName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const roleDisplay = role ? roleDisplayNames[role] : 'User';

  // Determine if sidebar should be expanded (either permanently expanded or temporarily on hover)
  const isExpanded = !isCollapsed || isHovered;

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-destructive-foreground border-r sticky top-0 h-screen transition-all duration-300 ease-in-out",
        isExpanded ? "w-[280px]" : "w-[80px]"
      )}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-20 flex items-center justify-start border-b relative">
        <div
          className={cn(
            "transition-all duration-300",
            isExpanded ? "h-14" : "h-10"
          )}
        >
          <img
            src={logoSrc}
            alt="DaraHaul Logo"
            className={cn(
              "h-full w-full object-contain transition-all duration-300 cursor-pointer",
              isExpanded ? "ml-4" : "ml-3"
            )}
            onMouseEnter={handleMouseEnter}
          />
        </div>

        {/* Collapse/Expand button - only show when expanded */}
        {isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-8 h-8 w-8 p-0 bg-transparent"
            onClick={handleCollapseToggle}
          >
            {isCollapsed ? (
              <PanelRightClose className="h-4 w-4 text-muted-foreground" />
            ) : (
              <PanelRightOpen className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>

      <nav
        className={cn(
          "flex-1 px-4 py-4 space-y-2 mt-10",
          !isExpanded && "px-2"
        )}
      >
        {navigationLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium font-inter text-sm text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
                {
                  "bg-muted text-foreground": isActive,
                  "px-2 justify-center": !isExpanded,
                }
              )
            }
            title={!isExpanded ? link.text : undefined}
          >
            <link.icon className="h-5 w-5 flex-shrink-0" />
            {isExpanded && (
              <span className="transition-opacity duration-300">
                {link.text}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="mt-auto border-t pt-4">
        <div className={cn(
          "px-4 py-3 bg-muted/50 rounded-lg mx-4 mb-4",
          !isExpanded && "px-2 mx-2"
        )}>
          <div className="flex items-center gap-3">
            {isExpanded && (
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-muted">
                  <CircleUser className="h-5 w-5 text-foreground" />
                </AvatarFallback>
              </Avatar>
            )}
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground truncate">
                  {userName || user?.email || 'User'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {roleDisplay}
                </div>
              </div>
            )}
             <Button
               variant="ghost"
               size="sm"
               className={cn(
                 "h-8 w-8 p-0",
                 isExpanded ? "" : "mx-auto"
               )}
               onClick={() => setShowLogoutModal(true)}
               title="Log out"
             >
                 <LogOut className="h-4 w-4 text-muted-foreground" />
             </Button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="sm:max-w-md top-[30%]">
          <DialogHeader className="text-center">
            <div className="flex items-center justify-center mb-6">
                <Info className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 text-center">
              Are you sure you want to log out?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm text-center">
              You will be returned to the login screen. Any unsaved changes may be lost. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-6 mt-4">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 rounded-lg"
              onClick={() => setShowLogoutModal(false)}
              size="lg"
            >
              <X className="h-4 w-4 text-muted-foreground" />
              Cancel
            </Button>
            <Button
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground"
              onClick={handleLogoutConfirm}
              size="lg"
            >
              <LogOut className="h-4 w-4 text-primary-foreground" />
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};
