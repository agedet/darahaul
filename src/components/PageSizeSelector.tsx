import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageSizeSelectorProps {
  value: number;
  onValueChange: (value: number) => void;
  options?: number[];
  className?: string;
}

export const PageSizeSelector = ({
  value,
  onValueChange,
  options = [20, 50, 100],
  className = "",
}: PageSizeSelectorProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-foreground font-medium">Page Size:</span>
      <Select
        value={value.toString()}
        onValueChange={(val) => onValueChange(parseInt(val))}
      >
        <SelectTrigger className="w-16 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};