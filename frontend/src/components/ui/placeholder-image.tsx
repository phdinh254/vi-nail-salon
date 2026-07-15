import { ImageIcon } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Khối placeholder có chủ đích cho vị trí cần ảnh thật.
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
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-accent bg-bg-subtle p-4 text-center",
        ratio,
        className,
      )}
    >
      <ImageIcon className="size-6 text-accent" aria-hidden="true" />
      <span className="text-caption text-text-muted">{label}</span>
    </div>
  );
}
