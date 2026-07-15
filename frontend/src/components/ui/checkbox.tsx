import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => (
    <label
      htmlFor={id}
      className={cn(
        "group inline-flex cursor-pointer items-start gap-2.5 text-body-sm text-text has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        className,
      )}
    >
      <span className="relative mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded border border-border bg-surface transition-colors duration-fast peer-focus-visible:ring-2 group-has-[:checked]:border-primary group-has-[:checked]:bg-primary group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-primary group-has-[:focus-visible]:ring-offset-1">
        <input ref={ref} id={id} type="checkbox" className="peer sr-only" {...props} />
        <Check
          className="size-3.5 text-primary-foreground opacity-0 transition-opacity duration-fast peer-checked:opacity-100"
          aria-hidden="true"
        />
      </span>
      {label ? <span>{label}</span> : null}
    </label>
  ),
);
Checkbox.displayName = "Checkbox";
