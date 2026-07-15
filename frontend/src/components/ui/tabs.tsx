"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

export type TabItem = { value: string; label: string; count?: number };

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 overflow-x-auto rounded-lg bg-bg-subtle p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-4 py-2 text-body-sm font-medium transition-colors duration-fast",
              active ? "bg-surface text-primary shadow-soft-sm" : "text-text-muted hover:text-text",
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-caption",
                  active ? "bg-accent/40 text-primary-active" : "bg-border/70 text-text-muted",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function useTabsState(defaultValue: string) {
  return useState(defaultValue);
}
