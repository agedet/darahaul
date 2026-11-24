import { LayoutDashboard, Settings, Truck, Users } from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { UserRole } from "./roles";
import { ROLE_DISPLAY_NAMES } from "./roles";

export type NavLinkItem = {
  to: string;
  icon: LucideIcon;
  text: string;
  permission?: string;
};

const adminLinks: NavLinkItem[] = [
  { to: "/company/dashboard", icon: LayoutDashboard, text: "Dashboard" },
  { to: "/company/fleet", icon: Truck, text: "Fleet" },
  { to: "/company/user-management", icon: Users, text: "User Management" },
];

// Admin_L2 is view-only and cannot access user management.
const adminL2Links: NavLinkItem[] = adminLinks.filter(
  (link) => link.to !== "/company/user-management",
);

export const superAdminLinks: NavLinkItem[] = [
  { to: "/admin/dashboard", icon: LayoutDashboard, text: "Dashboard" },
  { to: "/admin/fleet", icon: Truck, text: "Fleet" },
  { to: "/admin/user-management", icon: Users, text: "User Management" },
];

export const MechanicLinks: NavLinkItem[] = [
  { to: "/mechanic", icon: LayoutDashboard, text: "Dashboard" },
  { to: "/mechanic/settings", icon: Settings, text: "Settings" },
];

export const DriverLinks: NavLinkItem[] = [
  { to: "/driver", icon: LayoutDashboard, text: "Dashboard" },
  { to: "/driver/settings", icon: Settings, text: "Settings" },
];

// Sidebar navigation keyed by canonical frontend role.
export const navLinksMap: Record<UserRole, NavLinkItem[]> = {
  Admin_L1: adminLinks,
  Admin_L2: adminL2Links,
  Super_Admin: superAdminLinks,
  Mechanic: MechanicLinks,
  Driver: DriverLinks,
};

export const roleDisplayNames: Record<UserRole, string> = ROLE_DISPLAY_NAMES;
