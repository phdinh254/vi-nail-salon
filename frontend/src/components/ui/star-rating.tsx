import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

export function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`Đánh giá ${rating} trên 5 sao`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn("size-4", i < Math.round(rating) ? "fill-warning text-warning" : "text-border")}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
