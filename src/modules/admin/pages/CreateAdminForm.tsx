import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DashboardButton } from "@/components/DashboardButton";
import { Send } from "lucide-react";
import TextInputField from "@/components/TextInputField";
import SelectField from "@/components/SelectField";
import { useSuperAdmins } from "../hooks/useSuperAdmin";
import { toast } from "sonner";

// --- Schema and Options ---
const adminRoles = [
  { value: "Admin_L1", label: "Admin L1" },
  { value: "Admin_L2", label: "Admin L2" },
  { value: "Super_Admin", label: "Super Admin" },
];

const createAdminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string({ required_error: "A role must be selected" }),
  status: z.string().min(1, "Status is required"),
});

type CreateAdminFormValues = z.infer<typeof createAdminSchema>;

interface CreateAdminFormProps {
  onSuccess?: () => void;
}

export const CreateAdminForm = ({ onSuccess }: CreateAdminFormProps) => {
  const { createSuperAdmin, creating } = useSuperAdmins();
  
  const form = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "Super_Admin",
      status: "invited",
    },
  });

  async function onSubmit(values: CreateAdminFormValues) {
    try {
      await createSuperAdmin(values);
      toast.success("Admin invitation sent successfully!");
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "Failed to send admin invitation");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
        <input type="hidden" {...form.register("status")} />
        
        <TextInputField control={form.control} name="firstName" label="First Name" />
        <TextInputField control={form.control} name="lastName" label="Last Name" />
        <TextInputField control={form.control} name="email" label="Email Address" type="email" />
        
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
            disabled={creating}
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <DashboardButton type="submit" icon={Send} disabled={creating}>
            {creating ? "Sending Invite..." : "Send invite"}
          </DashboardButton>
        </div>
      </form>
    </Form>
  );
}; 