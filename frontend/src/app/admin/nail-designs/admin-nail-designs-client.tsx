"use client";

import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { useToast } from "@/components/providers/toast-provider";
import { NAIL_DESIGN_STYLES, nailDesignStyleLabel, nailDesignColorLabel, type NailDesign } from "@/types/nail-design";

export function AdminNailDesignsClient({ initialDesigns }: { initialDesigns: NailDesign[] }) {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState("ALL");

  const filtered = useMemo(
    () =>
      initialDesigns.filter((d) => {
        const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase());
        const matchesStyle = style === "ALL" || d.style === style;
        return matchesQuery && matchesStyle;
      }),
    [initialDesigns, query, style],
  );

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
        <Button
          onClick={() =>
            showToast({ variant: "info", title: "Thêm mẫu nail", description: "Chức năng tải ảnh sẽ khả dụng khi kết nối API thật." })
          }
        >
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
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-body-sm font-medium text-text">{design.name}</p>
                  {design.isNew ? <Badge tone="warning">Mới</Badge> : null}
                </div>
                <p className="mt-0.5 text-caption text-text-muted">
                  {nailDesignStyleLabel[design.style]} · {design.colors.map((c) => nailDesignColorLabel[c]).join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
