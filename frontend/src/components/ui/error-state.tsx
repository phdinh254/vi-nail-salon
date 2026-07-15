import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Đã có lỗi xảy ra",
  description = "Vui lòng thử lại sau ít phút.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-error/30 bg-error-bg px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-error/15 text-error">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <p className="text-body font-semibold text-text">{title}</p>
      <p className="max-w-sm text-body-sm text-text-muted">{description}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          Thử lại
        </Button>
      ) : null}
    </div>
  );
}
