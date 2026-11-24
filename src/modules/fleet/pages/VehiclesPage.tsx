import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { DashboardButton } from "@/components/DashboardButton";
import { ConfirmationDialog } from "@/components/common/ConfirmDialog";
import { LoadingScreen } from "@/components/ui/loading";
import { useFleetVehicles } from "../hooks/useFleetVehicles";
import {
  VEHICLE_CATEGORIES,
  VEHICLE_STATUS_LABELS,
  type FleetVehicle,
  type FleetVehicleStatus,
} from "@/lib/types";

const STATUS_STYLES: Record<FleetVehicleStatus, string> = {
  available: "text-[#008A2E] bg-[#ECFDF2]",
  assigned: "text-[#1D4ED8] bg-[#EFF6FF]",
  faulty: "text-[#DC7609] bg-[#FFFCF0]",
  in_repair: "text-[#E60000] bg-[#FFF0F0]",
};

const categoryLabel = (value: string) =>
  VEHICLE_CATEGORIES.find((c) => c.value === value)?.label ?? value;

const VehicleThumb = ({ vehicle }: { vehicle: FleetVehicle }) => {
  if (vehicle.images.length > 0) {
    return (
      <img
        src={vehicle.images[0]}
        alt={vehicle.name}
        className="h-10 w-10 rounded-md object-cover border"
      />
    );
  }
  return (
    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border">
      <Truck className="h-5 w-5 text-muted-foreground" />
    </div>
  );
};

const VehiclesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/admin")
    ? "/admin/fleet"
    : "/company/fleet";

  const { vehicles, loading, deleteVehicle } = useFleetVehicles();
  const [vehicleToDelete, setVehicleToDelete] = useState<FleetVehicle | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = useMemo<ColumnDef<FleetVehicle>[]>(
    () => [
      {
        id: "vehicle",
        header: "Vehicle",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <VehicleThumb vehicle={row.original} />
            <div>
              <p className="font-medium text-gray-900">{row.original.name}</p>
              {row.original.plateNumber && (
                <p className="text-xs text-muted-foreground">
                  {row.original.plateNumber}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => categoryLabel(row.original.category),
      },
      {
        id: "details",
        header: "Details",
        cell: ({ row }) => {
          const { make, model, year, color } = row.original;
          const parts = [make, model, year, color].filter(Boolean);
          return parts.length ? (
            <span className="text-sm text-gray-600">{parts.join(" · ")}</span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
            >
              {VEHICLE_STATUS_LABELS[status]}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date Added",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const vehicle = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`${basePath}/${vehicle.id}/edit`)}
              >
                <span className="sr-only">Edit vehicle</span>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setVehicleToDelete(vehicle)}
              >
                <span className="sr-only">Delete vehicle</span>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        },
      },
    ],
    [basePath, navigate]
  );

  const handleDelete = async () => {
    if (!vehicleToDelete) return;
    setIsDeleting(true);
    deleteVehicle(vehicleToDelete.id);
    toast.success("Vehicle removed from fleet");
    setIsDeleting(false);
    setVehicleToDelete(null);
  };

  if (loading) {
    return <LoadingScreen message="Loading fleet vehicles..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-card-foreground">
            Fleet Vehicles
          </h2>
          <p className="text-muted-foreground text-sm font-normal mt-1">
            Manage your company&apos;s vehicles. Assign them to drivers and send
            faulty ones in for repairs.
          </p>
        </div>
        <DashboardButton
          icon={Plus}
          onClick={() => navigate(`${basePath}/new`)}
        >
          Add Vehicle
        </DashboardButton>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        title="Vehicles"
      />

      <ConfirmationDialog
        isOpen={!!vehicleToDelete}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message="Are you sure you want to remove this vehicle from the fleet?"
        confirmText="Delete"
        type="delete"
        isProcessing={isDeleting}
        itemName={vehicleToDelete?.name}
      />
    </div>
  );
};

export default VehiclesPage;
