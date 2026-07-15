import { cn } from "@/utils/cn";

export type RadioOption = { value: string; label: string; description?: string; disabled?: boolean };

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  className,
  orientation = "vertical",
}: {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  orientation?: "vertical" | "horizontal";
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "flex gap-2.5",
        orientation === "vertical" ? "flex-col" : "flex-wrap",
        className,
      )}
    >
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-md border p-3.5 text-body-sm transition-colors duration-fast",
              checked ? "border-primary bg-accent/15" : "border-border bg-surface hover:bg-bg-subtle",
              option.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className="mt-0.5 size-4 accent-[#9A5E69] focus-visible:outline-none"
            />
            <span>
              <span className="block font-medium text-text">{option.label}</span>
              {option.description ? (
                <span className="text-caption">{option.description}</span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
