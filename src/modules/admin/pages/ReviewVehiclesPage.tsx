import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, X, Send, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading";
import { useApi } from "@/providers/ApiProvider";
import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";
import endpoint from "../libs/endpoint";
import type { ApiVehicle } from "@/lib/types";

// --- Mock UI Components (to make the code runnable in Canvas) ---
// In a real application, these would come from your actual UI library (e.g., shadcn/ui)

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    />
  );
};

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    ></textarea>
  );
};

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label: React.FC<LabelProps> = ({ children, className, ...props }) => {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

// --- End Mock UI Components ---

// Define the type for a single vehicle (transformed from API)
export type Vehicle = {
  id: string;
  name: string;
  company: string;
  admin: string;
  status: string;
  date: string;
  description?: string;
};

const ReviewVehiclesPage = () => {
  // Get the productId from the URL parameters
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // API hooks
  const api = useApi();
  const { user } = useUserAuth();

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
    };
  };

  // Fetch product details from API
  const fetchVehicleDetails = async () => {
    if (!vehicleId || !user?.id) {
      setError("Product ID or user not found");
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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch vehicle details";
      setError(errorMessage);
      console.error("Error fetching vehicle details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update product status
  const updateVehicleStatus = async (status: "approved" | "rejected") => {
    if (!vehicle?.id) {
      setError("Vehicle ID not found");
      return;
    }

    try {
      setUpdating(true);
      setError(null);


     await api.patch(endpoint.vehicleStatus(vehicle.id), {
        status: status,
      });

      setVehicle((prev) =>
        prev
          ? {
              ...prev,
              status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize for display
            }
          : null
      );

      // Navigate back to products list
      navigate("/admin/approve-vehicles");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to ${status} vehicle`;
      setError(errorMessage);
      console.error(`Error ${status}ing vehicle:`, err);
    } finally {
      setUpdating(false);
    }
  };

  // Effect to fetch the product when the component mounts or productId changes
  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicleId, user?.id]);

  // Handle Approve button click
  const handleApprove = async () => {
    await updateVehicleStatus("approved");
  };

  // Handle Reject button click
  const confirmReject = () => {
    if (vehicle) {
      setShowRejectDialog(true);
    }
  };

  // Handle confirm rejection
  const handleReject = async () => {
    await updateVehicleStatus("rejected");
    setShowRejectDialog(false);
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
              onClick={() => navigate("/admin/approve-vehicles")}
              variant="outline"
            >
              Back to Vehicles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen ">
      {" "}
      {/* Changed font-inter to  for broader compatibility */}
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-6 font-roboto">
        <span
          className="cursor-pointer hover:text-muted-foreground"
          onClick={() => navigate("/admin/approve-vehicles")}
        >
          Manage Vehicles
        </span>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground font-roboto">Review Vehicle</span>
      </div>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-roboto">
          {vehicle.name}
        </h1>
        <p className="text-gray-600 mt-2 text-muted-foreground">
          Review and approve vehicles submitted by companies.
        </p>
      </div>
      {/* Basic Details Section */}
      <div className="pb-8 shadow-sm border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          Basic Details
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-[50%]">
          {/* Product Name */}
          <div className="md:col-span-2">
            <Label htmlFor="productName" className="text-gray-700 font-medium">
              Vehicle Name
            </Label>
            <Input
              id="productName"
              className="mt-2 p-3 border border-gray-300 rounded-md bg-white focus:outline-none !focus:ring-0 !focus:border-gray-300 focus:shadow-none"
              value={vehicle.name}
              onChange={(e) => setVehicle({ ...vehicle, name: e.target.value })}
            />
          </div>

          {/* Product Description */}
          <div className="md:col-span-2">
            <Label
              htmlFor="productDescription"
              className="text-gray-700 font-medium"
            >
              Vehicle Description
            </Label>
            <Textarea
              id="productDescription"
              className="mt-2 p-3 border border-gray-300 rounded-md bg-white min-h-[200px] focus:outline-none focus:ring-0 focus:border-gray-300 focus:shadow-none"
              value={vehicle.description || "No description available"}
              onChange={(e) =>
                setVehicle({ ...vehicle, description: e.target.value })
              }
            />
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <div className="flex justify-end gap-4 mt-8">
          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent className="sm:max-w-[451px] p-6 rounded-lg shadow-lg">
              <DialogHeader className="flex flex-col items-center text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  You are about to reject this vehicle
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2 text-center">
                  You are about to reject the vehicle "
                  <span className="font-semibold text-gray-800">
                    {vehicle.name}
                  </span>
                  " submitted by{" "}
                  <span className="font-semibold text-gray-800">
                    {vehicle.company}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-start gap-4 mt-6">
                <button
                  type="button"
                  className=" h-[40px] w-[141px] bg-white text-sm font-semibold text-gray-800 border border-border rounded-sm hover:bg-gray-50 font-roboto"
                  onClick={() => setShowRejectDialog(false)}
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  onClick={handleReject}
                  disabled={updating}
                  className="h-[40px] w-[141px] bg-[#EF4444] text-sm text-white rounded-sm font-roboto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            onClick={confirmReject}
            disabled={updating}
            className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 ease-in-out border-border border font-roboto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
            <span>Reject</span>
          </button>
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={handleApprove}
            disabled={updating}
            className="flex items-center space-x-2 px-6 py-3 bg-[#008A2E] text-white font-semibold rounded-xl transition-all duration-200 ease-in-out font-roboto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            <span>{updating ? "Approving..." : "Approve Vehicle"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewVehiclesPage;