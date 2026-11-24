import React from 'react';
import {type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Extend ButtonProps and accept an Icon component as a prop
interface DashboardButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
  icon?: LucideIcon;
}

export const DashboardButton = ({
  children,
  icon: Icon,
  className,
  ...props
}: DashboardButtonProps) => {

  return (
    <Button
    size="lg"
      className={cn(
        "bg-primary text-primary-foreground font-semibold hover:bg-[#FFD166]/90 flex items-center justify-center text-sm px-6 rounded-md disabled:bg-muted disabled:text-muted-foreground",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 font-semibold" />}
      <span className='-mb-0.5'>
        {children}
      </span>
    </Button>
  );
};