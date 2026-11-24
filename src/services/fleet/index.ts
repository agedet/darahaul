import type { FleetVehicle, FleetVehicleInput } from "../../lib/types";

/**
 * Mock fleet vehicle store backed by localStorage.
 *
 * The backend endpoints for fleet vehicles (create with image upload,
 * driver assignment/commission, repair assignment) are not defined yet.
 * This store keeps the CRUD UI fully functional in the meantime — swap the
 * internals for `useApi` calls once the API contract is known.
 */

const STORAGE_KEY = "darahaul_fleet_vehicles_v1";
const MAX_IMAGES = 6;

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const seedVehicles: FleetVehicle[] = [
  {
    id: "veh-seed-1",
    name: "Delivery Truck 01",
    category: "economy",
    description: "Box truck used for intracity deliveries.",
    make: "Isuzu",
    model: "NPR",
    year: 2021,
    plateNumber: "ABC-123-XX",
    color: "White",
    images: [],
    status: "available",
    assignedDriverId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "veh-seed-2",
    name: "City Van 07",
    category: "economy",
    description: "Light van for last-mile deliveries.",
    make: "Toyota",
    model: "Hiace",
    year: 2019,
    plateNumber: "GHI-456-YY",
    color: "Silver",
    images: [],
    status: "assigned",
    assignedDriverId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "veh-seed-3",
    name: "Bus 12",
    category: "premium",
    description: "Minibus currently at the repair shop.",
    make: "Mercedes",
    model: "Sprinter",
    year: 2018,
    plateNumber: "JKL-789-ZZ",
    color: "Blue",
    images: [],
    status: "in_repair",
    assignedDriverId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

const readAll = (): FleetVehicle[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedVehicles));
      return seedVehicles;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = (vehicles: FleetVehicle[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
};

class FleetService {
  public static list(): FleetVehicle[] {
    return readAll().sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public static getById(id: string): FleetVehicle | null {
    return readAll().find((v) => v.id === id) ?? null;
  }

  public static create(input: FleetVehicleInput): FleetVehicle {
    const now = new Date().toISOString();
    const vehicle: FleetVehicle = {
      ...input,
      images: input.images.slice(0, MAX_IMAGES),
      id: uid(),
      status: "available",
      assignedDriverId: null,
      createdAt: now,
      updatedAt: now,
    };
    writeAll([vehicle, ...readAll()]);
    return vehicle;
  }

  public static update(
    id: string,
    input: Partial<FleetVehicleInput>
  ): FleetVehicle | null {
    const vehicles = readAll();
    const index = vehicles.findIndex((v) => v.id === id);
    if (index === -1) return null;

    const updated: FleetVehicle = {
      ...vehicles[index],
      ...input,
      images:
        input.images !== undefined
          ? input.images.slice(0, MAX_IMAGES)
          : vehicles[index].images,
      updatedAt: new Date().toISOString(),
    };
    vehicles[index] = updated;
    writeAll(vehicles);
    return updated;
  }

  public static remove(id: string): boolean {
    const vehicles = readAll();
    const next = vehicles.filter((v) => v.id !== id);
    if (next.length === vehicles.length) return false;
    writeAll(next);
    return true;
  }

  /** Convert image Files to data URLs for storage/preview. */
  public static filesToDataUrls(files: File[]): Promise<string[]> {
    return Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          })
      )
    );
  }
}

export default FleetService;
