import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DashboardButton } from "@/components/DashboardButton";
import { Send } from "lucide-react";
import TextInputField from "@/components/TextInputField";
import SelectField from "@/components/SelectField";
import { useSuperAdmins, type SuperAdmin } from "../hooks/useSuperAdmin";
import { toast } from "sonner";

// --- Schema and Options ---
const adminRoles = [
  { value: "Admin_L1", label: "Admin L1" },
  { value: "Admin_L2", label: "Admin L2" },
  { value: "Super_Admin", label: "Super Admin" },
];

const editAdminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "A role must be selected"),
});

type EditAdminFormValues = z.infer<typeof editAdminSchema>;

interface EditAdminFormProps {
  admin: SuperAdmin;
  onSuccess?: () => void;
}

export const EditAdminForm = ({ admin, onSuccess }: EditAdminFormProps) => {
  const { updateSuperAdmin, updating } = useSuperAdmins();

  const form = useForm<EditAdminFormValues>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: {
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
    },
  });

  // Track if form has any changes
  const isDirty = form.formState.isDirty;

  async function onSubmit(values: EditAdminFormValues) {
    try {
      await updateSuperAdmin(admin.id, values);
      toast.success("Admin updated successfully!");
      // Close the dialog and trigger refresh
      onSuccess?.();
    } catch (error: any) {
      console.error("Error updating admin:", error);
      toast.error(error.message || "Failed to update admin");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
        <TextInputField
          control={form.control}
          name="firstName"
          label="First Name"
        />
        <TextInputField
          control={form.control}
          name="lastName"
          label="Last Name"
        />
        <TextInputField
          control={form.control}
          name="email"
          label="Email Address"
          type="email"
          disabled
        />

        <SelectField
          control={form.control}
          name="role"
          label="Assign Role"
          options={adminRoles}
        />

        <div className="flex justify-end gap-3 pt-8">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={updating}
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <DashboardButton
            type="submit"
            icon={Send}
            disabled={updating || !isDirty}
          >
            {updating ? "Updating..." : "Update Admin"}
          </DashboardButton>
        </div>
      </form>
    </Form>
  );
};