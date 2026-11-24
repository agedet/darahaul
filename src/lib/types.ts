export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  userProfileImage?: string;
  phoneNumber?: string;
  jobTitle?: string;
}

// Product Category Types
export interface VehicleCategory {
  id: number;
  category: string;
  category_examples: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyCategoriesResponse {
  success: boolean;
  data: {
    company: {
      id: number;
      name: string;
    };
    categories: VehicleCategory[];
  };
}

// API Types for Companies
export interface ApiCompany {
  id: number;
  created_at: any;
  client_name: string | null;
  company_name: string;
  custom_vehicles: any;
  main_contact_first_name: string | null;
  main_contact_last_name: string | null;
  main_contact_email: string | null;
  company_city: string;
  company_state: string;
  company_country: string;
  company_zip_code: string;
  company_website: string;
  company_phone: string;
  company_email: string;
  company_street_address: string;
  main_contact_phone: string | null;
  main_contact_job_position: string | null;
  company_registration_id_type: string | null;
  company_registration_number: string | null;
  company_type: string | null;
  company_status: string;
  company_logo: string | null;
  subscription_type: string;
  paid: boolean;
  _count: {
    locations: number;
    user_company_access: number;
  };
}

export interface ApiCompaniesResponse {
  data: ApiCompany[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CompaniesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Types for Company Details and Updates
export interface CompanyDetails {
  id: string;
  name: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  email: string;
  phoneNumber: string;
  logo?: string;
  // Add other fields as needed
}

export interface CompanyUpdatePayload {
  company_name?: string;
  company_website?: string;
  company_street_address?: string;
  company_city?: string;
  company_state?: string;
  company_country?: string;
  company_zip_code?: string;
  company_email?: string;
  company_phone?: string;
  company_logo?: string;
}

export interface ApiCompanyDetailsResponse {
  data: ApiCompany;
  message: string;
}

export interface ApiCompanyUpdateResponse {
  data: ApiCompany;
  message: string;
}

// API Types for Products
export interface ApiVehicle {
  id: string;
  created_at: string;
  vehicle: string;
  description: string;
  category_id: string | null;
  company_id: string;
  location_id: string | null;
  status: string;
  company: {
    id: string;
    created_at: string;
    client_name: string | null;
    company_name: string;
    custom_products: any;
    company_api_key: string | null;
    company_city: string;
    company_state: string;
    company_country: string;
    company_zip_code: string;
    company_website: string;
    company_phone: string;
    company_email: string;
    company_street_address: string;
    main_contact_phone: string | null;
    main_contact_first_name: string | null;
    main_contact_last_name: string | null;
    main_contact_job_position: string | null;
    company_registration_id_type: string | null;
    company_registration_number: string | null;
    company_type: string | null;
    company_status: string;
    company_logo: string | null;
    subscription_type: string;
    paid: boolean;
  };
  locations: any | null;
  company_categories: any | null;
}

export interface ApiVehiclesResponse {
  data: ApiVehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface VehiclesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  phoneNumber?: string;
  jobTitle?: string;
  userProfileImage?: string;
}

// Fleet Vehicle Types
// Lifecycle: available -> assigned (driver, weekly commission)
//          assigned/available -> faulty -> in_repair (mechanic) -> available
export type FleetVehicleStatus =
  | "available"
  | "assigned"
  | "faulty"
  | "in_repair";

export interface FleetVehicle {
  id: string;
  name: string;
  category: string;
  description: string;
  make?: string;
  model?: string;
  year?: number;
  plateNumber?: string;
  color?: string;
  /** Image URLs or data URLs until the backend upload endpoint exists. */
  images: string[];
  status: FleetVehicleStatus;
  assignedDriverId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FleetVehicleInput {
  name: string;
  category: string;
  description: string;
  make?: string;
  model?: string;
  year?: number;
  plateNumber?: string;
  color?: string;
  images: string[];
}

export const VEHICLE_STATUS_LABELS: Record<FleetVehicleStatus, string> = {
  available: "Available",
  assigned: "Assigned",
  faulty: "Faulty",
  in_repair: "In Repair",
};

export const VEHICLE_CATEGORIES = [
  { value: "premium", label: "Premium" },
  { value: "economy", label: "Economy" },
  { value: "luxury", label: "Luxury" },
] as const;

export type FleetVehicleCategory =
  (typeof VEHICLE_CATEGORIES)[number]["value"];
