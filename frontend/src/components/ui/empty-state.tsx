import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-bg-subtle/60 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent/30 text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <p className="text-body font-semibold text-text">{title}</p>
      {description ? <p className="max-w-sm text-body-sm text-text-muted">{description}</p> : null}
      {actionLabel && actionHref ? (
        <Button asChild size="sm" className="mt-2">
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      ) : actionLabel && onAction ? (
        <Button size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
