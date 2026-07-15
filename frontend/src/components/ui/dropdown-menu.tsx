"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

export type DropdownMenuItem = {
  label: string;
  onSelect: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
};

export function DropdownMenu({
  trigger,
  items,
  align = "end",
}: {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {trigger}
      </button>
      {open ? (
        <div
          role="menu"
          className={cn(
            "animate-scale-in absolute z-20 mt-2 min-w-48 origin-top-right rounded-md border border-border bg-surface p-1.5 shadow-soft-lg",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-body-sm transition-colors duration-fast hover:bg-bg-subtle [&_svg]:size-4",
                item.destructive ? "text-error" : "text-text",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
