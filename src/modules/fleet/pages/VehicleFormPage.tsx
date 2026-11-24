import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading";
import { AddVehicleForm } from "@/components/forms/AddVehicleForm";
import { useFleetVehicles } from "../hooks/useFleetVehicles";
import type { FleetVehicle } from "@/lib/types";

const VehicleFormPage = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!vehicleId;
  const basePath = location.pathname.startsWith("/admin")
    ? "/admin/fleet"
    : "/company/fleet";

  const { getVehicle } = useFleetVehicles();
  const [vehicle, setVehicle] = useState<FleetVehicle | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    const found = getVehicle(vehicleId);
    if (found) {
      setVehicle(found);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }, [isEdit, vehicleId, getVehicle]);

  const goBack = () => navigate(basePath);

  if (loading) {
    return <LoadingScreen message="Loading vehicle details..." />;
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-600">Vehicle not found</p>
        <Button variant="outline" onClick={goBack}>
          Back to Fleet
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-muted-foreground">
        <span className="cursor-pointer hover:text-foreground" onClick={goBack}>
          Fleet Vehicles
        </span>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">
          {isEdit ? "Edit Vehicle" : "Add Vehicle"}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-gray-950">
          {isEdit ? vehicle?.name : "Add a Vehicle"}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isEdit
            ? "Update the vehicle's details and images."
            : "Add a vehicle to the company fleet with its details and images."}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <AddVehicleForm
          vehicle={vehicle}
          onSuccess={goBack}
          onCancel={goBack}
        />
      </div>
    </div>
  );
};

export default VehicleFormPage;
