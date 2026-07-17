"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { useToast } from "@/components/providers/toast-provider";
import { useApi } from "@/hooks/use-api";
import { listNailDesigns, listServices, createNailDesign, updateNailDesign } from "@/services/catalog.service";
import { ApiError } from "@/lib/api-client";
import { NAIL_DESIGN_STYLES, nailDesignStyleLabel, nailDesignColorLabel, type NailDesign } from "@/types/nail-design";
import { NailDesignFormDialog, type NailDesignFormValues } from "./nail-design-form-dialog";

export function AdminNailDesignsClient() {
  const { showToast } = useToast();
  const designsState = useApi(listNailDesigns, []);
  const servicesState = useApi(listServices, []);
  const initialDesigns = useMemo(() => designsState.data ?? [], [designsState.data]);
  const services = servicesState.data ?? [];
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NailDesign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(design: NailDesign) {
    setEditing(design);
    setFormOpen(true);
  }

  async function handleSubmit(values: NailDesignFormValues) {
    setIsSubmitting(true);
    try {
      const payload = { ...values, serviceId: values.serviceId || undefined };
      if (editing) {
        await updateNailDesign(editing.id, payload);
        showToast({ variant: "success", title: "Đã cập nhật mẫu nail", description: values.name });
      } else {
        await createNailDesign(payload);
        showToast({ variant: "success", title: "Đã thêm mẫu nail mới", description: values.name });
      }
      designsState.refetch();
      setFormOpen(false);
    } catch (err) {
      showToast({
        variant: "error",
        title: editing ? "Không thể cập nhật mẫu nail" : "Không thể thêm mẫu nail",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const filtered = useMemo(
    () =>
      initialDesigns.filter((d) => {
        const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase());
        const matchesStyle = style === "ALL" || d.style === style;
        return matchesQuery && matchesStyle;
      }),
    [initialDesigns, query, style],
  );

  if (designsState.isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (designsState.error) {
    return <p className="text-body-sm text-error">{designsState.error}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchInput placeholder="Tìm mẫu nail..." value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
          <Select value={style} onChange={(e) => setStyle(e.target.value)} className="sm:max-w-xs" aria-label="Lọc theo phong cách">
            <option value="ALL">Tất cả phong cách</option>
            {NAIL_DESIGN_STYLES.map((s) => (
              <option key={s} value={s}>
                {nailDesignStyleLabel[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Thêm mẫu mới
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Không tìm thấy mẫu nail phù hợp" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((design) => (
            <div key={design.id} className="overflow-hidden rounded-lg border border-border bg-surface">
              <PlaceholderImage label={`Ảnh mẫu nail: ${design.name}`} ratio="aspect-square" className="rounded-none border-none" />
              <div className="p-3">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate text-body-sm font-medium text-text">{design.name}</p>
                    {design.isNew ? <Badge tone="warning">Mới</Badge> : null}
                  </div>
                  <IconButton label={`Sửa ${design.name}`} size="sm" onClick={() => openEdit(design)}>
                    <Pencil className="size-4" aria-hidden="true" />
                  </IconButton>
                </div>
                <p className="mt-0.5 text-caption text-text-muted">
                  {nailDesignStyleLabel[design.style]} · {design.colors.map((c) => nailDesignColorLabel[c]).join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <NailDesignFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        services={services}
        editing={editing}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
