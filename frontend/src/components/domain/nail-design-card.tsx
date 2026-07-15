import Link from "next/link";
import { Heart } from "lucide-react";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { nailDesignStyleLabel, nailDesignColorLabel, type NailDesign } from "@/types/nail-design";
import { cn } from "@/utils/cn";

export function NailDesignCard({
  design,
  isFavorite,
  onToggleFavorite,
  onSelect,
  href,
}: {
  design: NailDesign;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onSelect?: () => void;
  href?: string;
}) {
  const detailHref = href ?? `/nail-gallery/${design.id}`;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-surface shadow-soft-sm transition-shadow duration-base hover:shadow-soft-md">
      <div className="relative">
        <Link href={detailHref} aria-label={`Xem chi tiết mẫu ${design.name}`}>
          <PlaceholderImage label={`Ảnh mẫu nail: ${design.name}`} ratio="aspect-square" className="rounded-none border-none" />
        </Link>
        {design.isNew ? (
          <Badge tone="warning" className="absolute left-3 top-3">
            Mới
          </Badge>
        ) : null}
        {onToggleFavorite ? (
          <IconButton
            label={isFavorite ? "Bỏ lưu mẫu nail này" : "Lưu mẫu nail này"}
            size="sm"
            onClick={onToggleFavorite}
            className={cn("absolute right-3 top-3 bg-surface/90 hover:bg-surface", isFavorite && "text-error")}
          >
            <Heart className={cn("size-4", isFavorite && "fill-error")} aria-hidden="true" />
          </IconButton>
        ) : null}
      </div>
      <div className="p-4">
        <Link href={detailHref} className="text-body font-semibold text-text hover:text-primary">
          {design.name}
        </Link>
        <p className="mt-1 text-caption text-text-muted">
          {nailDesignStyleLabel[design.style]} · {design.colors.map((c) => nailDesignColorLabel[c]).join(", ")}
        </p>
        {onSelect ? (
          <button
            type="button"
            onClick={onSelect}
            className="mt-3 text-body-sm font-semibold text-primary hover:underline"
          >
            Chọn mẫu này khi đặt lịch
          </button>
        ) : null}
      </div>
    </div>
  );
}
