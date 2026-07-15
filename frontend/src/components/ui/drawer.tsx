"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export function Drawer({
  open,
  onClose,
  title,
  side = "right",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "left" | "right" | "bottom";
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const panelPosition = {
    left: "left-0 top-0 h-full w-full max-w-xs animate-[reveal-up_var(--duration-base)_var(--ease-standard)] sm:max-w-sm",
    right: "right-0 top-0 h-full w-full max-w-xs sm:max-w-sm",
    bottom: "bottom-0 left-0 w-full max-h-[85vh] rounded-t-xl",
  }[side];

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-text/40"
      />
      <div className={cn("absolute animate-fade-in bg-surface shadow-soft-lg", panelPosition)}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-h3 font-serif font-semibold text-text">{title}</h2>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted hover:bg-bg-subtle hover:text-text"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="h-[calc(100%-65px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
