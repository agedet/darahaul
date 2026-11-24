import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomPhoneInput } from "@/components/auth/CustomPhoneInput";
import { useMechanicProfile } from "../../hooks/useMechanicProfile";
import UserService from "@/services/user";
import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";

interface MechanicFormState {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialty: string;
  certifications: string;
  yearsOfExperience: string;
  hourlyRate: string;
}

const emptyForm: MechanicFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  specialty: "",
  certifications: "",
  yearsOfExperience: "",
  hourlyRate: "",
};

const ProfileTab = () => {
  const { profile, loading: profileLoading } = useMechanicProfile();
  const { refetchUser } = useUserAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MechanicFormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        specialty: profile.specialization || "",
        certifications: profile.certifications || "",
        yearsOfExperience:
          profile.yearsOfExperience != null
            ? String(profile.yearsOfExperience)
            : "",
        hourlyRate:
          profile.hourlyRate != null ? String(profile.hourlyRate) : "",
      });
    }
  }, [profile]);

  const set = (key: keyof MechanicFormState) => (value: string) =>
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
        mechanic_onboarding: {
          specialty: form.specialty.trim() || undefined,
          certifications: form.certifications.trim() || undefined,
          years_of_experience:
            form.yearsOfExperience === ""
              ? undefined
              : Number(form.yearsOfExperience),
          hourly_rate:
            form.hourlyRate === "" ? undefined : Number(form.hourlyRate),
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
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              value={form.specialty}
              onChange={(e) => set("specialty")(e.target.value)}
              placeholder="e.g. Engine Diagnostics"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications</Label>
            <Input
              id="certifications"
              value={form.certifications}
              onChange={(e) => set("certifications")(e.target.value)}
              placeholder="e.g. ASE, manufacturer training"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearsOfExperience">Years of Experience</Label>
            <Input
              id="yearsOfExperience"
              value={form.yearsOfExperience}
              onChange={(e) => set("yearsOfExperience")(e.target.value)}
              placeholder="5"
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate</Label>
            <Input
              id="hourlyRate"
              value={form.hourlyRate}
              onChange={(e) => set("hourlyRate")(e.target.value)}
              placeholder="50.00"
              inputMode="decimal"
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
