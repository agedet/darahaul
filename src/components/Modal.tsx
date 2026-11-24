import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// How to use this component:
// <TextInputField
//   control={form.control}
//   name="email"
//   label="Email"
//   placeholder="Enter your email"
//   description="We'll never share your email."
//   type="email"
//   disabled={false}
//   className="mb-4"
// />

interface TextInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  timeZone?: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "email" | "tel" | "url" | "password";
  disabled?: boolean;
  className?: string;
}

export default function TextInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder,
  description,
  type = "text",
  disabled = false,
  className,
}: TextInputFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={className}>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
          <Input
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            {...field}
          />
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {fieldState.error && (
            <p className="text-red-600 text-xs">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}