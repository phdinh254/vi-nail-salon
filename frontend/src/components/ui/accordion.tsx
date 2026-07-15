"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export type AccordionItem = { id: string; title: string; content: React.ReactNode };

export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className={cn("divide-y divide-border rounded-lg border border-border bg-surface", className)}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`accordion-panel-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-body font-medium text-text hover:bg-bg-subtle"
              >
                {item.title}
                <ChevronDown
                  className={cn("size-5 shrink-0 text-text-muted transition-transform duration-base", open && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={`accordion-panel-${item.id}`}
              className={cn("grid transition-[grid-template-rows] duration-base", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-body-sm text-text-muted">{item.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
