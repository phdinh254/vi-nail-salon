import { cn } from "@/utils/cn";

export function Avatar({
  initials,
  size = "md",
  className,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = { sm: "size-8 text-caption", md: "size-10 text-body-sm", lg: "size-14 text-h3" }[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-accent/50 font-semibold text-primary-active",
        sizeClass,
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
