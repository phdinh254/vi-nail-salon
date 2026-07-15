import { forwardRef } from "react";
import { cn } from "@/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, leadingIcon, trailingIcon, ...props }, ref) => {
    if (leadingIcon || trailingIcon) {
      return (
        <div className="relative">
          {leadingIcon ? (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted [&_svg]:size-4.5">
              {leadingIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            aria-invalid={invalid || undefined}
            className={cn(
              "h-11 w-full rounded-md border border-border bg-surface text-body text-text placeholder:text-text-muted transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-bg-subtle disabled:text-text-muted",
              leadingIcon ? "pl-10 pr-4" : "px-4",
              trailingIcon ? "pr-10" : "",
              invalid && "border-error focus-visible:ring-error",
              className,
            )}
            {...props}
          />
          {trailingIcon ? (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted [&_svg]:size-4.5">
              {trailingIcon}
            </span>
          ) : null}
        </div>
      );
    }
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-11 w-full rounded-md border border-border bg-surface px-4 text-body text-text placeholder:text-text-muted transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-bg-subtle disabled:text-text-muted",
          invalid && "border-error focus-visible:ring-error",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
