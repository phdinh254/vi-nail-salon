import { cn } from "@/utils/cn";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-3 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
      <span className="sr-only">{label}</span>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-fast",
          checked ? "bg-primary" : "bg-border",
        )}
      >
        <input
          id={id}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            "inline-block size-4.5 translate-x-1 rounded-full bg-surface shadow-soft-sm transition-transform duration-fast peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1",
            checked && "translate-x-6",
          )}
        />
      </span>
    </label>
  );
}
