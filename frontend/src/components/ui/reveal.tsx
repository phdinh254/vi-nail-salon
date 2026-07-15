"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/utils/cn";

export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={visible ? { animationDelay: `${delayMs}ms` } : { opacity: 0 }}
      className={cn(visible && "animate-reveal-up", className)}
    >
      {children}
    </div>
  );
}
