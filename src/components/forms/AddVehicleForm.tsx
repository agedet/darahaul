import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, Send, Trash2, Truck, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DashboardButton } from "@/components/DashboardButton";
import TextInputField from "@/components/TextInputField";
import TextAreaField from "@/components/TextAreaField";
import SelectField from "@/components/SelectField";
import FleetService from "@/services/fleet";
import {
  VEHICLE_CATEGORIES,
  type FleetVehicle,
  type FleetVehicleInput,
} from "@/lib/types";

const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const vehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  category: z.string().min(1, "Category is required"),
  description: z
    .string()
    .refine((v) => v.trim() === "" || v.trim().length >= 10, {
      message: "Description must be at least 10 characters",
    })
    .optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z
    .string()
    .optional()
    .refine((v) => v === undefined || v === "" || /^\d{4}$/.test(v), {
      message: "Enter a valid 4-digit year",
    }),
  plateNumber: z.string().optional(),
  color: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface AddVehicleFormProps {
  /** When provided the form runs in edit mode for this vehicle. */
  vehicle?: FleetVehicle | null;
  onSuccess?: (vehicle: FleetVehicle) => void;
  onCancel?: () => void;
}

interface PendingImage {
  id: string;
  file: File;
  preview: string;
}

const toInput = (values: VehicleFormValues): FleetVehicleInput => ({
  name: values.name.trim(),
  category: values.category,
  description: values.description?.trim() ?? "",
  make: values.make?.trim() || undefined,
  model: values.model?.trim() || undefined,
  year: values.year ? parseInt(values.year, 10) : undefined,
  plateNumber: values.plateNumber?.trim() || undefined,
  color: values.color?.trim() || undefined,
  images: [],
});

/**
 * Form to add a vehicle and its details to the fleet.
 * Used by admin_L1 (company admins) and super_admin.
 */
export const AddVehicleForm = ({
  vehicle,
  onSuccess,
  onCancel,
}: AddVehicleFormProps) => {
  const isEdit = !!vehicle;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>(
    vehicle?.images ?? []
  );
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: vehicle?.name ?? "",
      category: vehicle?.category ?? "",
      description: vehicle?.description ?? "",
      make: vehicle?.make ?? "",
      model: vehicle?.model ?? "",
      year: vehicle?.year?.toString() ?? "",
      plateNumber: vehicle?.plateNumber ?? "",
      color: vehicle?.color ?? "",
    },
  });

  const totalImages = existingImages.length + pendingImages.length;

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const accepted: PendingImage[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name} exceeds the 5MB limit`);
        continue;
      }
      if (totalImages + accepted.length >= MAX_IMAGES) {
        toast.error(`You can upload up to ${MAX_IMAGES} images`);
        break;
      }
      accepted.push({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }
    setPendingImages((prev) => [...prev, ...accepted]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removePendingImage = (id: string) => {
    setPendingImages((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  async function onSubmit(values: VehicleFormValues) {
    try {
      setIsSubmitting(true);
      const newImageUrls = await FleetService.filesToDataUrls(
        pendingImages.map((p) => p.file)
      );
      const input: FleetVehicleInput = {
        ...toInput(values),
        images: [...existingImages, ...newImageUrls],
      };

      const saved = isEdit
        ? FleetService.update(vehicle.id, input)
        : FleetService.create(input);

      if (!saved) {
        toast.error("Vehicle not found");
        return;
      }

      toast.success(
        isEdit ? "Vehicle updated successfully!" : "Vehicle added to fleet!"
      );
      onSuccess?.(saved);
    } catch (err) {
      console.error("Vehicle form submission error:", err);
      toast.error("An error occurred while saving the vehicle");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TextInputField
            control={form.control}
            name="name"
            label="Vehicle Name"
            placeholder="e.g. Delivery Truck 02"
          />

          <SelectField
            control={form.control}
            name="category"
            label="Vehicle Category"
            placeholder="Select a category"
            options={VEHICLE_CATEGORIES}
          />

          <TextInputField
            control={form.control}
            name="make"
            label="Make"
            placeholder="e.g. Isuzu"
          />

          <TextInputField
            control={form.control}
            name="model"
            label="Model"
            placeholder="e.g. NPR"
          />

          <TextInputField
            control={form.control}
            name="year"
            label="Year"
            placeholder="e.g. 2022"
          />

          <TextInputField
            control={form.control}
            name="plateNumber"
            label="Plate Number"
            placeholder="e.g. ABC-123-XX"
          />

          <TextInputField
            control={form.control}
            name="color"
            label="Color"
            placeholder="e.g. White"
            className="md:col-span-2"
          />
        </div>

        <TextAreaField
          control={form.control}
          name="description"
          label="Description"
          placeholder="Describe the vehicle's condition, usage, and any notes..."
          className="min-h-[120px]"
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium leading-none">
                Vehicle Images
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Up to {MAX_IMAGES} images, 5MB each.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={totalImages >= MAX_IMAGES || isSubmitting}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Add Images
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
          </div>

          {totalImages === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
            >
              <Truck className="h-8 w-8" />
              <span className="text-sm">
                Click to upload vehicle photos
              </span>
            </button>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {existingImages.map((src, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative aspect-square rounded-lg overflow-hidden border group"
                >
                  <img
                    src={src}
                    alt={`Vehicle image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {pendingImages.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-lg overflow-hidden border group"
                >
                  <img
                    src={img.preview}
                    alt={img.file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePendingImage(img.id)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <DashboardButton type="submit" icon={Send} disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
                ? "Save Changes"
                : "Add Vehicle"}
          </DashboardButton>
        </div>
      </form>
    </Form>
  );
};

export default AddVehicleForm;
