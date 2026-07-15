"use client";

import { cloneElement, useId, useState } from "react";
import { cn } from "@/utils/cn";

export function Tooltip({
  label,
  children,
  side = "top",
}: {
  label: string;
  children: React.ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom";
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {cloneElement(children, { "aria-describedby": id })}
      <span
        role="tooltip"
        id={id}
        className={cn(
          "pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-text px-2.5 py-1.5 text-caption text-bg transition-opacity duration-fast",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        {label}
      </span>
    </span>
  );
}
