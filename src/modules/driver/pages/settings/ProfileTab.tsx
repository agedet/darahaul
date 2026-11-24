import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomPhoneInput } from "@/components/auth/CustomPhoneInput";
import { useDriverProfile } from "../../hooks/useDriverProfile";
import UserService from "@/services/user";
import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";

interface DriverFormState {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  address: string;
  emergencyPhone: string;
  emergencyContactName: string;
}

const emptyForm: DriverFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  licenseNumber: "",
  address: "",
  emergencyPhone: "",
  emergencyContactName: "",
};

const ProfileTab = () => {
  const { profile, loading: profileLoading } = useDriverProfile();
  const { refetchUser } = useUserAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DriverFormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        licenseNumber: profile.licenseNumber || "",
        address: profile.address || "",
        emergencyPhone: profile.emergencyPhone || "",
        emergencyContactName: profile.emergencyContactName || "",
      });
    }
  }, [profile]);

  const set = (key: keyof DriverFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      await UserService.updateProfile({
        first_name: form.firstName,
        last_name: form.lastName,
        phone_number: form.phoneNumber,
      });

      await UserService.completeOnboarding({
        driver_onboarding: {
          license_number: form.licenseNumber.trim() || undefined,
          address: form.address.trim() || undefined,
          emergency_phone: form.emergencyPhone.trim() || undefined,
          emergency_contact_name:
            form.emergencyContactName.trim() || undefined,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
      refetchUser();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading profile information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b mb-6">
        <h3 className="text-base font-semibold py-2">Personal Details</h3>
        <p className="text-sm text-muted-foreground">
          Update your profile details here
        </p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => set("firstName")(e.target.value)}
              placeholder="Enter your first name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => set("lastName")(e.target.value)}
              placeholder="Enter your last name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Driver's License Number</Label>
            <Input
              id="licenseNumber"
              value={form.licenseNumber}
              onChange={(e) => set("licenseNumber")(e.target.value)}
              placeholder="DLS123456"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => set("address")(e.target.value)}
              placeholder="Residential address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
            <Input
              id="emergencyContactName"
              value={form.emergencyContactName}
              onChange={(e) => set("emergencyContactName")(e.target.value)}
              placeholder="Full name of emergency contact"
            />
          </div>
          <div className="space-y-2">
            <Label>Emergency Contact Phone</Label>
            <CustomPhoneInput
              value={form.emergencyPhone}
              onChange={(value) => set("emergencyPhone")(value || "")}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <CustomPhoneInput
              value={form.phoneNumber}
              onChange={(value) => set("phoneNumber")(value || "")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={form.email} disabled />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
