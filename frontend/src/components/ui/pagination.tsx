import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        aria-label="Trang trước"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex size-9 items-center justify-center rounded-md text-text-muted hover:bg-bg-subtle disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? "page" : undefined}
          onClick={() => onChange(p)}
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-md text-body-sm font-medium",
            p === page ? "bg-primary text-primary-foreground" : "text-text hover:bg-bg-subtle",
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        aria-label="Trang sau"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="inline-flex size-9 items-center justify-center rounded-md text-text-muted hover:bg-bg-subtle disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
