"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/providers/toast-provider";
import type { Promotion } from "@/types/promotion";
import { formatDateShortVN } from "@/utils/format";

export function AdminPromotionsClient({ initialPromotions }: { initialPromotions: Promotion[] }) {
  const { showToast } = useToast();
  const [promotions, setPromotions] = useState(initialPromotions);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Button
          onClick={() =>
            showToast({ variant: "info", title: "Tạo ưu đãi mới", description: "Biểu mẫu đầy đủ sẽ khả dụng khi kết nối API thật." })
          }
        >
          <Plus className="size-4" aria-hidden="true" />
          Tạo ưu đãi mới
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {promotions.map((promo) => (
          <div key={promo.id} className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge tone="warning">{promo.discountLabel}</Badge>
                <p className="mt-2 text-body font-semibold text-text">{promo.title}</p>
              </div>
              <Switch
                id={`promo-${promo.id}`}
                checked={promo.isActive}
                label={`Bật/tắt ${promo.title}`}
                onChange={(checked) => {
                  setPromotions((prev) => prev.map((p) => (p.id === promo.id ? { ...p, isActive: checked } : p)));
                  showToast({ variant: "info", title: checked ? "Đã bật ưu đãi" : "Đã tắt ưu đãi" });
                }}
              />
            </div>
            <p className="mt-2 text-body-sm text-text-muted">{promo.description}</p>
            <p className="mt-2 text-caption text-text-muted">
              {formatDateShortVN(new Date(promo.validFrom))} - {formatDateShortVN(new Date(promo.validTo))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
