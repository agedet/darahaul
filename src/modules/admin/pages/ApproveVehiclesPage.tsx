import { useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageSizeSelector } from "@/components/PageSizeSelector";
import { DataTable } from "@/components/DataTable";
import { useVehicleCategories } from "../hooks/useVehicleCategories";
import { LoadingScreen } from "@/components/ui/loading";
import { useSearch } from "../context/SearchContext";
import { useDebouncedSearch } from "../hooks/useDebouncedSearch";
import { usePermissions } from "@/hooks/usePermissions";

// Define the type for a single product
export type Vehicle = {
  id: string;
  name: string;
  company: string;
  admin: string;
  status: string;
  date: string;
};

const ApproveVehiclesPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();

  // Check if user has permission to approve vehicles
  if (!permissions.canApproveVehicles) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-muted-foreground">Access Denied</h3>
          <p className="text-sm text-muted-foreground mt-2">
            You do not have permission to approve vehicles.
          </p>
        </div>
      </div>
    );
  }

  // Use the API hook
  const {
    vehicles,
    loading,
    error,
    pagination,
    refetch,
    setPage,
    setLimit,
    search,
  } = useVehicleCategories();

  // Get search term from context and apply debouncing
  const { searchTerm } = useSearch();
  const debouncedSearchTerm = useDebouncedSearch(searchTerm, 500);
  const previousSearchTerm = useRef<string>("");

  // Effect to trigger search when debounced search term changes
  useEffect(() => {
    // Avoid making unnecessary API calls if the search term hasn't actually changed
    if (debouncedSearchTerm === previousSearchTerm.current) {
      return;
    }

    previousSearchTerm.current = debouncedSearchTerm;

    if (debouncedSearchTerm.trim()) {
      search(debouncedSearchTerm);
    } else {
      // If search is cleared, refetch without search
      refetch();
    }
  }, [debouncedSearchTerm, search, refetch]);

  // Removed handleStatusChange since we only show Pending products

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

  // Filter products based on selected status and search results
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    // Only show products with "Pending" status
    filtered = filtered.filter(
      (vehicle: Vehicle) => vehicle.status === "Pending"
    );

    return filtered;
  }, [vehicles]);

  // Since we only show Pending vehicles, no need for status filtering
  // Removed availableStatuses as it's no longer needed

  // Create custom pagination for filtered vehicles
  const filteredVehiclesPagination = useMemo(() => {
    return {
      ...pagination,
      total: filteredVehicles.length,
      totalPages: Math.ceil(filteredVehicles.length / pagination.limit),
      hasNext:
        pagination.page < Math.ceil(filteredVehicles.length / pagination.limit),
      hasPrev: pagination.page > 1,
    };
  }, [pagination, filteredVehicles.length]);
  

  // Define the columns for the data table
  const columns = useMemo<ColumnDef<Vehicle>[]>(
    () => [
      { accessorKey: "name", header: "Vehicle Name" },
      { accessorKey: "admin", header: "Admin" },
      { accessorKey: "company", header: "Company" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          let textColorClass = "";
          let bgColorClass = "";

          // Apply colors based on status
          if (status === "Approved") {
            textColorClass = "text-[#008A2E]"; // A darker green for text
            bgColorClass = "bg-[#ECFDF2]"; // A light green for background
          } else if (status === "Draft") {
            textColorClass = "text-[#DC7609]"; // A darker yellow/orange for text
            bgColorClass = "bg-[#FFFCF0]"; // A light yellow/orange for background
          } else if (status === "Pending") {
            textColorClass = "text-[#DC7609]"; // A darker yellow/orange for text
            bgColorClass = "bg-[#FFFCF0]"; // A light yellow/orange for background
          } else if (status === "Rejected") {
            textColorClass = "text-[#E60000]";
            bgColorClass = "bg-[#FFf0f0]"; // A darker red for text
          }
          // Add more conditions for other statuses if needed

          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${textColorClass} ${bgColorClass}`}
            >
              {status}
            </span>
          );
        },
      },
      { accessorKey: "date", header: "Date Added" },

      {
        id: "actions",
        cell: ({ row }) => {
          const vehicle = row.original;
          const vehicleId = vehicle.id;

          return (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/admin/approve-vehicles/${vehicleId}`)}
            >
              <span className="sr-only">Edit vehicle</span>
              <Edit className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [navigate]
  );

  // Show loading state
  if (loading && vehicles.length === 0) {
    return (
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-card-foreground">
              Vehicle Approval Queue
            </h2>
            <p className="text-muted-foreground text-sm font-normal mt-1">
              Review and approve vehicles submitted by companies.
            </p>
          </div>
        </div>
        <LoadingScreen message="Loading vehicles..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-card-foreground">
              Vehicle Approval Queue
            </h2>
            <p className="text-muted-foreground text-sm font-normal mt-1">
              Review and approve vehicles submitted by companies.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8 border rounded-lg">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show no vehicles message
  if (!loading && filteredVehicles.length === 0) {
    return (
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-card-foreground">
              Vehicle Approval Queue
            </h2>
            <p className="text-muted-foreground text-sm font-normal mt-1">
              Review and approve vehicles submitted by companies.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8 border rounded-lg">
          <div className="text-center">
            <Package className="h-8 w-8 text-muted-foreground mb-4 mx-auto" />
            <p className="text-muted-foreground text-lg mb-4">
              {debouncedSearchTerm.trim()
                ? `No vehicles found matching "${debouncedSearchTerm}"`
                : "No vehicles pending approval"}
            </p>
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
            Vehicle Approval Queue
          </h2>
          <p className="text-muted-foreground text-sm font-normal mt-1">
            Review and approve vehicles submitted by companies.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredVehicles}
        title={`Loan Products`}
        pagination={filteredVehiclesPagination}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
        toolbar={
          <div className="flex items-center gap-4">
            {/* Page Size Selector */}
            <PageSizeSelector
              value={pagination?.limit}
              onValueChange={handlePageSizeChange}
            />
          </div>
        }
      />
    </div>
  );
};

export default ApproveVehiclesPage;