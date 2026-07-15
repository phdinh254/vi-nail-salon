"use client";

import { useId } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Khối placeholder có chủ đích cho vị trí cần ảnh thật — KHÔNG phải ảnh thật.
 * Có hoạ tiết trang trí thương hiệu để không trông thô sơ, nhưng viền đứt nét
 * và nhãn luôn hiển thị rõ để không ai nhầm đây là ảnh sản phẩm/tiệm thật.
 * Thay bằng next/image trỏ tới ảnh thật trong public/images khi có tài sản.
 */
export function PlaceholderImage({
  label,
  ratio = "aspect-[4/5]",
  className,
}: {
  label: string;
  ratio?: string;
  className?: string;
}) {
  const patternId = `placeholder-pattern-${useId()}`;

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg border border-dashed border-accent bg-bg-subtle",
        ratio,
        className,
      )}
    >
      <svg className="absolute inset-0 size-full text-accent" aria-hidden="true">
        <defs>
          <pattern id={patternId} width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
            <path
              d="M17 6 L19.4 13.6 L27 16 L19.4 18.4 L17 26 L14.6 18.4 L7 16 L14.6 13.6 Z"
              fill="currentColor"
              opacity="0.22"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      <div className="relative flex flex-col items-center gap-2 rounded-md bg-surface/80 px-4 py-3 text-center backdrop-blur-sm">
        <ImageIcon className="size-6 text-primary" aria-hidden="true" />
        <span className="text-caption text-text-muted">{label}</span>
      </div>
    </div>
  );
}
