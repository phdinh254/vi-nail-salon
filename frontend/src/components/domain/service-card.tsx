import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { serviceCategoryLabel, type Service } from "@/types/service";
import { formatDurationMinutes, formatPriceRange } from "@/utils/format";

export function ServiceCard({ service, className }: { service: Service; className?: string }) {
  return (
    <div className={`flex flex-col rounded-lg border border-border bg-surface p-5 shadow-soft-sm transition-shadow duration-base hover:shadow-soft-md ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-3">
        <Badge tone="primary">{serviceCategoryLabel[service.category]}</Badge>
        {service.isFeatured ? <Badge tone="warning">Nổi bật</Badge> : null}
      </div>
      <h3 className="mt-3 text-h3 font-serif font-semibold text-text">{service.name}</h3>
      <p className="mt-1.5 text-body-sm text-text-muted">{service.shortDescription}</p>
      <div className="mt-4 flex items-center gap-4 text-caption text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden="true" />
          {formatDurationMinutes(service.durationMinutes)}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-body font-semibold text-primary">
          {!service.isFixedPrice ? "Từ " : ""}
          {formatPriceRange(service.priceFrom, service.priceTo ?? undefined)}
        </p>
        <Button asChild size="sm" variant="secondary">
          <Link href={`/services/${service.slug}`}>Xem chi tiết</Link>
        </Button>
      </div>
    </div>
  );
}
