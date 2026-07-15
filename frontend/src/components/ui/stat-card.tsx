import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  tone?: "neutral" | "success" | "warning" | "error";
}) {
  const toneClass = {
    neutral: "bg-accent/30 text-primary",
    success: "bg-success-bg text-success",
    warning: "bg-warning-bg text-warning",
    error: "bg-error-bg text-error",
  }[tone];

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-soft-sm">
      <div className="flex items-center justify-between">
        <p className="text-caption uppercase tracking-wide text-text-muted">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-full", toneClass)}>
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-h2 font-serif font-semibold text-text">{value}</p>
      {trend ? <p className="mt-1 text-caption text-text-muted">{trend}</p> : null}
    </div>
  );
}
