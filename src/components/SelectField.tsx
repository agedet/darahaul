import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
  options: readonly { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}

export default function SelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder,
  options,
  disabled = false,
  className,
}: SelectFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={className}>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
          <Select
            onValueChange={field.onChange}
            value={field.value === "none" || !field.value ? "" : field.value}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.error && (
            <p className="text-red-600 text-xs">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}