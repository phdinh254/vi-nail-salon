import { forwardRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export type IconButtonProps = Omit<ButtonProps, "size"> & {
  label: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = { sm: "size-9", md: "size-11", lg: "size-12" };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, size = "md", className, variant = "ghost", children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        aria-label={label}
        variant={variant}
        className={cn("p-0", sizeMap[size], className)}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
IconButton.displayName = "IconButton";
