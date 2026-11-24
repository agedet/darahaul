import { useCallback, useEffect, useState } from "react";
import FleetService from "@/services/fleet";
import type { FleetVehicle, FleetVehicleInput } from "@/lib/types";

export const useFleetVehicles = () => {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    setVehicles(FleetService.list());
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createVehicle = useCallback(
    (input: FleetVehicleInput) => {
      const vehicle = FleetService.create(input);
      refetch();
      return vehicle;
    },
    [refetch]
  );

  const updateVehicle = useCallback(
    (id: string, input: Partial<FleetVehicleInput>) => {
      const vehicle = FleetService.update(id, input);
      refetch();
      return vehicle;
    },
    [refetch]
  );

  const deleteVehicle = useCallback(
    (id: string) => {
      const removed = FleetService.remove(id);
      if (removed) refetch();
      return removed;
    },
    [refetch]
  );

  const getVehicle = useCallback((id: string) => FleetService.getById(id), []);

  return {
    vehicles,
    loading,
    refetch,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicle,
  };
};
