import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { MoreVertical, ChevronDown } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageSizeSelector } from "@/components/PageSizeSelector";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useSuperAdmins } from "../hooks/useSuperAdmin";
import { useSearch } from "../context/SearchContext";
import { useDebouncedSearch } from "../hooks/useDebouncedSearch";
// import { toast } from "sonner";
import { LoadingPage } from "@/components/ui/loading";
// import { CreateAdminDialog } from "../components/CreateAdminDialog";
// import { EditAdminDialog } from "../components/EditAdminDialog";
// import { DeleteAdminDialog } from "../components/DeleteAdminDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { normalizeRole, ROLE_DISPLAY_NAMES } from "@/lib/roles";

// Status badge color mapping
const statusVariant = {
  active: "success",
  invited: "warning",
  Active: "success",
  Invited: "warning",
};

// Available statuses and roles for filtering
const allStatuses = ["Active", "Invited"];
const allRoles = ["Admin L1", "Admin L2", "Super Admin", "Mechanic", "Driver"];

const ROLE_FILTER_VALUES: Record<string, string> = {
  "Admin L1": "Admin_L1",
  "Admin L2": "Admin_L2",
  "Super Admin": "Super_Admin",
  Mechanic: "Mechanic",
  Driver: "Driver",
};

// --- Reusable Filter Dropdown ---
const FilterDropdown = ({
  value,
  setValue,
  options,
  title,
}: {
  value: string;
  setValue: (value: string) => void;
  options: string[];
  title: string;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="flex items-center gap-2">
        {value} <ChevronDown className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => setValue(title)}>
        {title}
      </DropdownMenuItem>
      {options.map((option) => (
        <DropdownMenuItem key={option} onClick={() => setValue(option)}>
          {option}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export const ManageRolesPage = () => {
  const { searchTerm } = useSearch();
  const debouncedSearchTerm = useDebouncedSearch(searchTerm, 500);
  const previousSearchTerm = useRef<string>("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  const {
    superAdmins,
    pagination,
    loading,
    error,
    deleting,
    goToPage,
    setLimit,
    filterByStatus,
    filterByRole,
    deleteSuperAdmin,
    updateFilters,
  } = useSuperAdmins();
  const permissions = usePermissions();

  // Check if user has permission to manage roles
  if (!permissions.canManageSuperAdminRoles) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Access Denied
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            You do not have permission to manage user roles.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Avoid making unnecessary API calls if the search term hasn't actually changed
    if (debouncedSearchTerm === previousSearchTerm.current) {
      return;
    }

    previousSearchTerm.current = debouncedSearchTerm;

    // Use updateFilters to work with current filters
    updateFilters({ search: debouncedSearchTerm });
  }, [debouncedSearchTerm, updateFilters]);

  // Handle status filtering
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    if (status === "All Statuses") {
      filterByStatus("all");
    } else {
      filterByStatus(status.toLowerCase());
    }
  };

  // Handle role filtering
  const handleRoleChange = (role: string) => {
    setRoleFilter(role);
    if (role === "All Roles") {
      filterByRole("all");
    } else {
      filterByRole(ROLE_FILTER_VALUES[role] ?? role);
    }
  };

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      // Add a small delay to prevent rapid successive calls
      setTimeout(() => {
        setLimit(pageSize);
      }, 100);
    },
    [setLimit]
  );

  const tableData = useMemo(() => {
    // Sort by created_at in descending order (latest first)
    const sortedAdmins = [...superAdmins].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    return sortedAdmins.map((admin) => ({
      id: admin.id,
      companyName: `${admin.firstName} ${admin.lastName}`,
      role: (() => {
        const normalized = normalizeRole(admin.role);
        return normalized ? ROLE_DISPLAY_NAMES[normalized] : admin.role;
      })(),
      emailAddress: admin.email,
      // assignments: "Platform-wide",
      status: admin.status,
      dateAdded: new Date(admin.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));
  }, [superAdmins]);

  // Table columns definition
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: "companyName", header: "Name" },
      { accessorKey: "role", header: "Role" },
      { accessorKey: "emailAddress", header: "Email Address" },
      // { accessorKey: "assignments", header: "Assignments" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status as keyof typeof statusVariant;
          const variant = statusVariant[status] as
            | "default"
            | "secondary"
            | "outline"
            | "destructive"
            | "success"
            | "warning"
            | "error"
            | "normal"
            | null
            | undefined;
          return <Badge variant={variant}>{row.original.status}</Badge>;
        },
      },
      { accessorKey: "dateAdded", header: "Date Added" },
      {
        id: "actions",
        cell: ({ row }) => {
          const adminId = row.original.id;
        //   const admin = row.original.companyName;
          // Find the admin data from superAdmins array
          const adminData = superAdmins.find((sa) => sa.id === adminId);

          const [dropdownOpen, setDropdownOpen] = useState(false);

          return (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {adminData && (
                  <DropdownMenuItem
                    className="text-sm focus:outline-none"
                    onSelect={(e) => e.preventDefault()}
                  >
                    {/* <EditAdminDialog
                      admin={adminData}
                      onClose={() => setDropdownOpen(false)}
                    /> */}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive text-sm focus:outline-none focus:text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  {/* <DeleteAdminDialog
                    trigger={<span className="w-full">Delete Admin</span>}
                    adminName={admin}
                    loading={deleting}
                    onConfirm={async () => {
                      try {
                        await deleteSuperAdmin(adminId);
                        toast.success(`Admin "${admin}" deleted successfully`);
                      } catch (err: any) {
                        console.error("Error deleting admin:", err);
                        toast.error(err.message || "Failed to delete admin");
                      }
                    }}
                  /> */}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [superAdmins, deleting, deleteSuperAdmin]
  );

  // Show loading state
  if (loading) {
    return <LoadingPage message="Loading super admins..." />;
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-card-foreground">
              User Role Management
            </h2>
            <p className="text-muted-foreground text-sm font-normal mt-1">
              Create and manage admins and their settings
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Ok, got it</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-card-foreground">
            User Role Management
          </h2>
          <p className="text-muted-foreground text-sm font-normal mt-1">
            Create and manage admins and their settings
          </p>
        </div>
        {/* <CreateAdminDialog /> */}
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        title="Users"
        pagination={pagination}
        onPageChange={goToPage}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
        toolbar={
          <div className="flex items-center gap-4">
            {/* Page Size Selector */}
            <PageSizeSelector
              value={pagination?.limit || 20}
              onValueChange={handlePageSizeChange}
            />

            {/* Status Filter */}
            <FilterDropdown
              value={statusFilter}
              setValue={handleStatusChange}
              options={allStatuses}
              title="All Statuses"
            />

            {/* Role Filter */}
            <FilterDropdown
              value={roleFilter}
              setValue={handleRoleChange}
              options={allRoles}
              title="All Roles"
            />
          </div>
        }
      />
    </div>
  );
};