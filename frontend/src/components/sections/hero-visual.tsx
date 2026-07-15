"use client";

import { useRef, useState } from "react";
import { PlaceholderImage } from "@/components/ui/placeholder-image";

export function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    setOffset({ x, y });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      className="relative mx-auto grid max-w-md grid-cols-2 gap-4"
    >
      <div
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        className="col-span-2 transition-transform duration-300 ease-out"
      >
        <PlaceholderImage label="Ảnh không gian tiệm Lys Nail Studio" ratio="aspect-[16/10]" />
      </div>
      <div
        style={{ transform: `translate(${offset.x * 1.4}px, ${offset.y * 1.4}px)` }}
        className="transition-transform duration-300 ease-out"
      >
        <PlaceholderImage label="Ảnh mẫu nail hoàn thiện" ratio="aspect-square" />
      </div>
      <div
        style={{ transform: `translate(${offset.x * -1.2}px, ${offset.y * -1.2}px)` }}
        className="mt-6 transition-transform duration-300 ease-out"
      >
        <PlaceholderImage label="Ảnh kỹ thuật viên đang phục vụ" ratio="aspect-square" />
      </div>
    </div>
  );
}
