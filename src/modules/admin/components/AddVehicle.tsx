import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardButton } from "@/components/DashboardButton";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useApi } from "@/providers/ApiProvider";
import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import TextInputField from "@/components/TextInputField";
import TextAreaField from "@/components/TextAreaField";
import SelectField from "@/components/SelectField";
import { useVehicleCategories } from "@/modules/admin/hooks/useVehicleCategories";
import { toast } from "sonner";

// Manual Product Form Schema
const manualVehicleSchema = z.object({
  vehicleName: z.string().min(1, "Vehicle name is required"),
  vehicleDescription: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  category_id: z.string(),
});

type ManualVehicleFormValues = z.infer<typeof manualVehicleSchema>;

interface AddVehicleAIFormProps {
  companyId: string;
  onSuccess?: (newVehicle?: any) => void;
  onClose?: () => void;
}

export const AddVehicleAIForm = ({
  companyId,
  onSuccess,
  onClose,
}: AddVehicleAIFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { post } = useApi();
  const { role } = useUserAuth();
  const { categories, isLoading: isLoadingCategories } = useVehicleCategories(companyId);

  const form = useForm<ManualVehicleFormValues>({
    resolver: zodResolver(manualVehicleSchema),
    defaultValues: {
      vehicleName: "",
      vehicleDescription: "",
      category_id: "none",
    },
  });

  async function onSubmit(values: ManualVehicleFormValues) {
    try {
      setIsSubmitting(true);

      // Determine status based on role
      // Super Admins: approved, Company Admins: pending
      const status = role === "Super_Admin" ? "approved" : "pending";

      // Call the API endpoint to create the product
      const response = await post(`/admin/company_vehicle/${companyId}`, {
        vehicle_name: values.vehicleName,
        vehicle_description: values.vehicleDescription,
        category_id: values.category_id && values.category_id !== "none" ? parseInt(values.category_id) : null,
        status: status,
      });

      if (response) {
        toast.success("Vehicle created successfully!");
        form.reset();
        onSuccess?.(response);
        onClose?.();
      } else {
        toast.error("Failed to create vehicle");
      }
    } catch (err) {
      toast.error("An error occurred while creating the vehicle");
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <TextInputField
          control={form.control}
          name="vehicleName"
          label="Vehicle Name"
          placeholder="Enter Vehicle Name"
        />

        <SelectField
          control={form.control}
          name="category_id"
          label="Vehicle Category"
          placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"}
          options={categories}
          disabled={isLoadingCategories}
        />

        <TextAreaField
          control={form.control}
          name="vehicleDescription"
          label="Vehicle Description"
          placeholder="Enter Vehicle Description"
        />

        <DialogFooter className="pt-4 sm:justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DialogClose>
          <DashboardButton type="submit" icon={Send} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Vehicle"}
          </DashboardButton>
        </DialogFooter>
      </form>
    </Form>
  );
};