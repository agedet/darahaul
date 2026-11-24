import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingScreen } from "@/components/ui/loading";
import { useApi } from "@/providers/ApiProvider";
import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";
import endpoint from "../libs/endpoint";
import { VEHICLE_CATEGORIES, type ApiVehicle } from "@/lib/types";
import { toast } from "sonner";

// Define the type for a single product (transformed from API)
export type Vehicle = {
  id: string;
  name: string;
  company: string;
  admin: string;
  status: string;
  date: string;
  description?: string;
  category_id?: string;
  company_id?: string;
};

const EditVehiclePage = () => {
  // Get the productId from the URL parameters
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [originalVehicle, setOriginalVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // API hooks
  const api = useApi();
  const { user } = useUserAuth();
  
  // Extract company ID from the product data for fallback navigation
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Transform API product data to match the expected Product interface
  const transformVehicleData = (apiVehicle: ApiVehicle): Vehicle => {
    // Format date
    let date = "N/A";
    if (apiVehicle.created_at && typeof apiVehicle.created_at === "string") {
      const parsedDate = new Date(apiVehicle.created_at);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    }

    // Capitalize status
    let status = "N/A";
    if (apiVehicle.status && typeof apiVehicle.status === "string") {
      status =
        apiVehicle.status.charAt(0).toUpperCase() + apiVehicle.status.slice(1);
    }

    // Get admin name from company contact info
    let admin = "N/A";
    if (apiVehicle.company) {
      if (
        apiVehicle.company.main_contact_first_name &&
        apiVehicle.company.main_contact_last_name
      ) {
        admin = `${apiVehicle.company.main_contact_first_name} ${apiVehicle.company.main_contact_last_name}`;
      } else if (
        apiVehicle.company.main_contact_first_name ||
        apiVehicle.company.main_contact_last_name
      ) {
        admin =
          apiVehicle.company.main_contact_first_name ||
          apiVehicle.company.main_contact_last_name ||
          "N/A";
      } else if (apiVehicle.company.company_email) {
        const emailUser = apiVehicle.company.company_email.split("@")[0];
        admin = emailUser.charAt(0).toUpperCase() + emailUser.slice(1);
      }
    }

    return {
      id: apiVehicle.id || "N/A",
      name: apiVehicle.vehicle || "N/A",
      company: apiVehicle.company?.company_name || "N/A",
      admin: admin,
      status: status,
      date: date,
      description: apiVehicle.description || "",
      category_id: apiVehicle.category_id?.toString() || "",
      company_id: apiVehicle.company_id?.toString() || "",
    };
  };

  // Fetch product details from API
  const fetchVehicleDetails = async () => {
    if (!vehicleId || !user?.id) {
      setError("Vehicle ID or user not found");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`${endpoint.vehicles}/${vehicleId}`);
      // Handle different possible response structures
      let apiVehicleData;
      if (response?.data) {
        apiVehicleData = response.data;
      } else if (response && typeof response === "object") {
        // If the response itself is the product data (no wrapper)
        apiVehicleData = response;
      } else {
        throw new Error("Invalid API response structure");
      }

      const transformedData = transformVehicleData(apiVehicleData);
      setVehicle(transformedData);
      setOriginalVehicle(transformedData);
      
      // Extract company ID from the product data for breadcrumb
      if (apiVehicleData.company?.id) {
        setCompanyId(apiVehicleData.company.id.toString());
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch product details";
      setError(errorMessage);
      console.error("Error fetching product details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Save product changes
  const saveVehicleChanges = async () => {
    if (!vehicle?.id) {
      setError("Vehicle ID not found");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await api.put(`/admin/vehicle/${vehicle.id}`, {
        vehicle: vehicle.name,
        description: vehicle.description,
        category_id: vehicle.category_id && vehicle.category_id !== "" && vehicle.category_id !== "none" ? parseInt(vehicle.category_id) : null,
      });

      // Show success toast with backend message
      const successMessage = response?.message || "Vehicle updated successfully!";
      toast.success(successMessage);

      // Navigate back based on where the user came from
      const returnPath = sessionStorage.getItem('branchVehicleEditReturnPath');
      if (returnPath) {
        sessionStorage.removeItem('branchVehicleEditReturnPath');
        navigate(returnPath);
      } else {
        // Fallback to company details page
        navigate(`/admin/manage-companies/${companyId}`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save vehicle changes";
      console.error("Error saving vehicle changes:", err);
      
      // Show error toast
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Effect to fetch the product when the component mounts or productId changes
  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicleId, user?.id]);

  // Check if form has been modified
  const hasFormChanged = () => {
    if (!vehicle || !originalVehicle) return false;
    
    return (
      vehicle.name !== originalVehicle.name ||
      vehicle.description !== originalVehicle.description ||
      vehicle.category_id !== originalVehicle.category_id
    );
  };

  // Handle Save button click
  const handleSave = async () => {
    await saveVehicleChanges();
  };

  // Handle Cancel button click
  const handleCancel = () => {
    // Navigate back based on where the user came from
    const returnPath = sessionStorage.getItem('branchVehicleEditReturnPath');
    if (returnPath) {
      sessionStorage.removeItem('branchVehicleEditReturnPath');
      navigate(returnPath);
    } else {
      // Fallback to company details page
      navigate(`/admin/manage-companies/${companyId}`);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white min-h-screen ">
        <LoadingScreen message="Loading vehicle details..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8 bg-white min-h-screen ">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={fetchVehicleDetails} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!vehicle) {
    return (
      <div className="p-8 bg-white min-h-screen ">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Vehicle not found</p>
            <Button
              onClick={() => navigate(`/admin/manage-companies/${companyId}`)}
              variant="outline"
            >
              Back to Company
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen ">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-6 font-roboto">
        <span
          className="cursor-pointer hover:text-muted-foreground"
          onClick={() => navigate("/admin/manage-companies")}
        >
          Manage Companies
        </span>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="cursor-pointer hover:text-muted-foreground" onClick={() => navigate("/admin/fleet")}>
          Fleet Vehicles
        </span>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground font-roboto">Edit Vehicle</span>
      </div>
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-roboto">
          {vehicle.name}
        </h1>
        <p className="text-gray-600 mt-2 text-muted-foreground">
          Edit and update loan vehicle details.
        </p>
      </div>
      
      {/* Basic Details Section */}
      <div className="pb-8 shadow-sm border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          Basic Details
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-[50%]">
          {/* Product Name */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="vehicleName">Vehicle Name</Label>
            <Input
              id="vehicleName"
              value={vehicle.name}
              onChange={(e) => setVehicle({ ...vehicle, name: e.target.value })}
            />
          </div>

          {/* Product Category */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="category_id">Vehicle Category</Label>
            <Select
              value={vehicle.category_id || "none"}
              onValueChange={(value) => setVehicle({ ...vehicle, category_id: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {VEHICLE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Description */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="vehicleDescription">Vehicle Description</Label>
            <Textarea
              id="vehicleDescription"
              value={vehicle.description || ""}
              onChange={(e) =>
                setVehicle({ ...vehicle, description: e.target.value })
              }
              className="min-h-[200px]"
            />
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={saving}
          size="lg"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          disabled={saving || !hasFormChanged()}
          size="lg"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default EditVehiclePage;