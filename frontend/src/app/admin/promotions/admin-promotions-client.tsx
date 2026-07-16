"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/providers/toast-provider";
import { useApi } from "@/hooks/use-api";
import { listPromotions, updatePromotion } from "@/services/catalog.service";
import { ApiError } from "@/lib/api-client";
import { formatDateShortVN } from "@/utils/format";

export function AdminPromotionsClient() {
  const { showToast } = useToast();
  const promotionsState = useApi(listPromotions, []);
  const promotions = promotionsState.data ?? [];

  async function handleToggleActive(id: string, checked: boolean) {
    try {
      await updatePromotion(id, { isActive: checked });
      showToast({ variant: "info", title: checked ? "Đã bật ưu đãi" : "Đã tắt ưu đãi" });
      promotionsState.refetch();
    } catch (err) {
      showToast({
        variant: "error",
        title: "Không thể cập nhật ưu đãi",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  }

  if (promotionsState.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full" />
        ))}
      </div>
    );
  }

  if (promotionsState.error) {
    return <p className="text-body-sm text-error">{promotionsState.error}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Button
          onClick={() =>
            showToast({ variant: "info", title: "Tạo ưu đãi mới", description: "Biểu mẫu đầy đủ sẽ khả dụng khi bổ sung form tạo ưu đãi." })
          }
        >
          <Plus className="size-4" aria-hidden="true" />
          Tạo ưu đãi mới
        </Button>
      </div>

      {promotions.length === 0 ? (
        <EmptyState title="Chưa có chương trình ưu đãi nào" />
      ) : (
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
                  onChange={(checked) => handleToggleActive(promo.id, checked)}
                />
              </div>
              <p className="mt-2 text-body-sm text-text-muted">{promo.description}</p>
              <p className="mt-2 text-caption text-text-muted">
                {formatDateShortVN(new Date(promo.validFrom))} - {formatDateShortVN(new Date(promo.validTo))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
