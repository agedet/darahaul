import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

interface LoadingPageProps {
  message?: string;
  className?: string;
}

interface LoadingTableProps {
  columns?: number;
  className?: string;
}

interface LoadingCardProps {
  className?: string;
}

// Basic spinner component
export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <Loader2 
      className={cn(
        "animate-spin text-primary",
        sizeClasses[size],
        className
      )} 
    />
  );
};

// Full page loading component
export const LoadingPage = ({ message = "Loading...", className }: LoadingPageProps) => {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="flex items-center gap-3">
        <LoadingSpinner size="lg" />
        <span className="text-muted-foreground text-sm">{message}</span>
      </div>
    </div>
  );
};

// Table loading component
export const LoadingTable = ({ columns = 6, className }: LoadingTableProps) => {
  return (
    <div className={cn("border rounded-lg bg-white", className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
          <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden">
        {/* Header row */}
        <div className="flex bg-muted">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1 p-3">
              <div className="h-4 bg-muted-foreground/20 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex border-b last:border-b-0">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 p-3">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="h-8 bg-muted rounded w-8 animate-pulse"></div>
          <div className="h-8 bg-muted rounded w-8 animate-pulse"></div>
          <div className="h-8 bg-muted rounded w-8 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Card loading component
export const LoadingCard = ({ className }: LoadingCardProps) => {
  return (
    <div className={cn("border rounded-lg bg-white p-6", className)}>
      <div className="space-y-4">
        {/* Title skeleton */}
        <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
        
        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-4/6 animate-pulse"></div>
        </div>

        {/* Action skeleton */}
        <div className="flex justify-end pt-4">
          <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Inline loading component for buttons and small elements
export const LoadingInline = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LoadingSpinner size="sm" />
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  );
};

// Loading overlay for modals and dialogs
export const LoadingOverlay = ({ 
  message = "Processing...", 
  className 
}: { 
  message?: string; 
  className?: string; 
}) => {
  return (
    <div className={cn(
      "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50",
      className
    )}>
      <div className="flex items-center gap-3 bg-white rounded-lg p-6 shadow-lg">
        <span className="text-foreground font-medium">{message}</span>
      </div>
    </div>
  );
}; 

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}; 