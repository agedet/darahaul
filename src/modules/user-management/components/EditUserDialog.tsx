import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import TextInputField from "@/components/TextInputField";
import SelectField from "@/components/SelectField";
import { DashboardButton } from "@/components/DashboardButton";
import {
  useUpdateUser,
  type ManagedUser,
  type UpdateUserPayload,
} from "../hooks/useUsers";

const editUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  role: z.string({ required_error: "A role must be selected" }),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  user: ManagedUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleOptions: { value: string; label: string }[];
}

export const EditUserDialog = ({
  user,
  open,
  onOpenChange,
  roleOptions,
}: EditUserDialogProps) => {
  const updateUser = useUpdateUser();

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      role: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
      });
    }
  }, [user, form]);

  async function onSubmit(values: EditUserFormValues) {
    if (!user) return;
    try {
      const payload: UpdateUserPayload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number || undefined,
        role: values.role,
      };
      await updateUser.mutateAsync({ id: user.id, payload });
      toast.success("User updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update user");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details and role.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <TextInputField
                control={form.control}
                name="first_name"
                label="First Name"
              />
              <TextInputField
                control={form.control}
                name="last_name"
                label="Last Name"
              />
            </div>
            <TextInputField
              control={form.control}
              name="email"
              label="Email Address"
              type="email"
            />
            <TextInputField
              control={form.control}
              name="phone_number"
              label="Phone Number"
              type="tel"
            />
            <SelectField
              control={form.control}
              name="role"
              label="Role"
              options={roleOptions}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
