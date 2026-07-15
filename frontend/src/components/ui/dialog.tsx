"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-description" : undefined}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-border bg-surface p-0 shadow-soft-lg backdrop:bg-text/40 open:animate-scale-in",
        className,
      )}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <h2 id="dialog-title" className="text-h3 font-serif font-semibold text-text">
            {title}
          </h2>
          {description ? (
            <p id="dialog-description" className="mt-1 text-body-sm text-text-muted">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Đóng hộp thoại"
          onClick={onClose}
          className="shrink-0 rounded-md p-1.5 text-text-muted hover:bg-bg-subtle hover:text-text"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
