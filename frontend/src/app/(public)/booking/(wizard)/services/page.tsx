"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Clock } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { BookingStepLayout } from "@/features/booking/booking-step-layout";
import { useBooking } from "@/features/booking/booking-context";
import { services } from "@/fixtures/services";
import { SERVICE_CATEGORIES, serviceCategoryLabel } from "@/types/service";
import { cn } from "@/utils/cn";
import { formatDurationMinutes, formatPriceRange } from "@/utils/format";

function ServicesStepContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, toggleService, update } = useBooking();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [preselected, setPreselected] = useState(false);

  useEffect(() => {
    if (preselected) return;
    const serviceParam = searchParams.get("service");
    const nailDesignParam = searchParams.get("nailDesign");
    if (serviceParam && !state.serviceIds.includes(serviceParam)) {
      toggleService(serviceParam);
    }
    if (nailDesignParam) {
      update("nailDesignId", nailDesignParam);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chỉ đọc query string một lần khi vào bước này
    setPreselected(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselected]);

  const tabs = [
    { value: "ALL", label: "Tất cả" },
    ...SERVICE_CATEGORIES.map((cat) => ({ value: cat, label: serviceCategoryLabel[cat] })),
  ];

  const filtered = useMemo(
    () =>
      services.filter((service) => {
        const matchesCategory = category === "ALL" || service.category === category;
        const matchesQuery = service.name.toLowerCase().includes(query.trim().toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [category, query],
  );

  return (
    <BookingStepLayout
      title="Chọn dịch vụ"
      description="Bạn có thể chọn nhiều dịch vụ trong cùng một lượt hẹn."
      onContinue={() => router.push("/booking/staff")}
      continueDisabled={state.serviceIds.length === 0}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs items={tabs} value={category} onChange={setCategory} className="sm:max-w-xl" />
        <SearchInput
          placeholder="Tìm dịch vụ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tìm kiếm dịch vụ"
        />
      </div>

      <ul className="mt-6 flex flex-col gap-2.5">
        {filtered.map((service) => {
          const selected = state.serviceIds.includes(service.id);
          return (
            <li key={service.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => toggleService(service.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors duration-fast",
                  selected ? "border-primary bg-accent/15" : "border-border bg-surface hover:bg-bg-subtle",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded border",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {selected ? <Check className="size-3.5" aria-hidden="true" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-body font-medium text-text">{service.name}</span>
                    {service.isFeatured ? <Badge tone="warning">Nổi bật</Badge> : null}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-caption text-text-muted">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {formatDurationMinutes(service.durationMinutes)}
                  </span>
                </span>
                <span className="shrink-0 text-body-sm font-semibold text-primary">
                  {!service.isFixedPrice ? "Từ " : ""}
                  {formatPriceRange(service.priceFrom, service.priceTo ?? undefined)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </BookingStepLayout>
  );
}

export default function ServicesStepPage() {
  return (
    <Suspense>
      <ServicesStepContent />
    </Suspense>
  );
}
