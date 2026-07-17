"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/providers/toast-provider";
import { useApi } from "@/hooks/use-api";
import { listPromotions, updatePromotion, createPromotion } from "@/services/catalog.service";
import { ApiError } from "@/lib/api-client";
import { formatDateShortVN } from "@/utils/format";
import type { Promotion } from "@/types/promotion";
import { PromotionFormDialog, type PromotionFormValues } from "./promotion-form-dialog";

export function AdminPromotionsClient() {
  const { showToast } = useToast();
  const promotionsState = useApi(listPromotions, []);
  const promotions = promotionsState.data ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(promo: Promotion) {
    setEditing(promo);
    setFormOpen(true);
  }

  async function handleSubmit(values: PromotionFormValues) {
    setIsSubmitting(true);
    try {
      if (editing) {
        await updatePromotion(editing.id, values);
        showToast({ variant: "success", title: "Đã cập nhật ưu đãi", description: values.title });
      } else {
        await createPromotion(values);
        showToast({ variant: "success", title: "Đã tạo ưu đãi mới", description: values.title });
      }
      promotionsState.refetch();
      setFormOpen(false);
    } catch (err) {
      showToast({
        variant: "error",
        title: editing ? "Không thể cập nhật ưu đãi" : "Không thể tạo ưu đãi",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <Button onClick={openCreate}>
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
                <div className="flex items-center gap-2">
                  <IconButton label={`Sửa ${promo.title}`} size="sm" onClick={() => openEdit(promo)}>
                    <Pencil className="size-4" aria-hidden="true" />
                  </IconButton>
                  <Switch
                    id={`promo-${promo.id}`}
                    checked={promo.isActive}
                    label={`Bật/tắt ${promo.title}`}
                    onChange={(checked) => handleToggleActive(promo.id, checked)}
                  />
                </div>
              </div>
              <p className="mt-2 text-body-sm text-text-muted">{promo.description}</p>
              <p className="mt-2 text-caption text-text-muted">
                {formatDateShortVN(new Date(promo.validFrom))} - {formatDateShortVN(new Date(promo.validTo))}
              </p>
            </div>
          ))}
        </div>
      )}

      <PromotionFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        editing={editing}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
