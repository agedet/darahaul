import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import TextInputField from "@/components/TextInputField";
import SelectField from "@/components/SelectField";
import { DashboardButton } from "@/components/DashboardButton";
import {
  useCreateInvitation,
  type CreateInvitationPayload,
} from "../hooks/useInvitations";

const inviteSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  role: z.string({ required_error: "A role must be selected" }),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteUserDialogProps {
  roleOptions: { value: string; label: string }[];
}

export const InviteUserDialog = ({ roleOptions }: InviteUserDialogProps) => {
  const createInvitation = useCreateInvitation();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      role: roleOptions[0]?.value ?? "",
    },
  });

  async function onSubmit(values: InviteFormValues) {
    try {
      const payload: CreateInvitationPayload = {
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        role: values.role,
        phone_number: values.phone_number || undefined,
      };
      await createInvitation.mutateAsync(payload);
      toast.success(`Invitation sent to ${values.email}`);
      form.reset();
    } catch (error: any) {
      toast.error(error?.message || "Failed to send invitation");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DashboardButton type="button" icon={UserPlus}>
          Invite User
        </DashboardButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation email with a link to join the platform.
          </DialogDescription>
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
              <Button
                type="submit"
                disabled={createInvitation.isPending}
              >
                {createInvitation.isPending ? "Sending..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
