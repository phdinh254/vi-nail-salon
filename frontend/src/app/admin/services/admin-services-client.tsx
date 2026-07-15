"use client";

import { useMemo, useState } from "react";
import { Search, Pencil } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useToast } from "@/components/providers/toast-provider";
import { SERVICE_CATEGORIES, serviceCategoryLabel, type Service } from "@/types/service";
import { formatDurationMinutes, formatPriceRange } from "@/utils/format";

export function AdminServicesClient({ initialServices }: { initialServices: Service[] }) {
  const { showToast } = useToast();
  const [services, setServices] = useState(initialServices);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [editing, setEditing] = useState<Service | null>(null);
  const [draft, setDraft] = useState({ priceFrom: 0, priceTo: 0, durationMinutes: 0 });

  const filtered = useMemo(
    () =>
      services.filter((s) => {
        const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === "ALL" || s.category === category;
        return matchesQuery && matchesCategory;
      }),
    [services, query, category],
  );

  function openEdit(service: Service) {
    setEditing(service);
    setDraft({ priceFrom: service.priceFrom, priceTo: service.priceTo ?? service.priceFrom, durationMinutes: service.durationMinutes });
  }

  function saveEdit() {
    if (!editing) return;
    setServices((prev) =>
      prev.map((s) =>
        s.id === editing.id
          ? { ...s, priceFrom: draft.priceFrom, priceTo: s.isFixedPrice ? null : draft.priceTo, durationMinutes: draft.durationMinutes }
          : s,
      ),
    );
    showToast({ variant: "success", title: "Đã cập nhật dịch vụ", description: editing.name });
    setEditing(null);
  }

  const columns: DataTableColumn<Service>[] = [
    {
      header: "Dịch vụ",
      cell: (s) => (
        <span>
          {s.name} {s.isFeatured ? <Badge tone="warning" className="ml-1.5">Nổi bật</Badge> : null}
        </span>
      ),
    },
    { header: "Nhóm", cell: (s) => serviceCategoryLabel[s.category] },
    { header: "Thời lượng", cell: (s) => formatDurationMinutes(s.durationMinutes) },
    { header: "Giá", cell: (s) => formatPriceRange(s.priceFrom, s.priceTo ?? undefined) },
    {
      header: "",
      cell: (s) => (
        <IconButton label={`Sửa ${s.name}`} size="sm" onClick={() => openEdit(s)}>
          <Pencil className="size-4" aria-hidden="true" />
        </IconButton>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput placeholder="Tìm dịch vụ..." value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:max-w-xs" aria-label="Lọc theo nhóm dịch vụ">
          <option value="ALL">Tất cả nhóm</option>
          {SERVICE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {serviceCategoryLabel[cat]}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Không tìm thấy dịch vụ phù hợp" />
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title="Chỉnh sửa dịch vụ" description={editing?.name}>
        <div className="flex flex-col gap-4">
          <Field id="edit-price-from" label={editing?.isFixedPrice ? "Giá" : "Giá từ"}>
            <Input
              id="edit-price-from"
              type="number"
              value={draft.priceFrom}
              onChange={(e) => setDraft((d) => ({ ...d, priceFrom: Number(e.target.value) }))}
            />
          </Field>
          {editing && !editing.isFixedPrice ? (
            <Field id="edit-price-to" label="Giá đến">
              <Input
                id="edit-price-to"
                type="number"
                value={draft.priceTo}
                onChange={(e) => setDraft((d) => ({ ...d, priceTo: Number(e.target.value) }))}
              />
            </Field>
          ) : null}
          <Field id="edit-duration" label="Thời lượng (phút)">
            <Input
              id="edit-duration"
              type="number"
              value={draft.durationMinutes}
              onChange={(e) => setDraft((d) => ({ ...d, durationMinutes: Number(e.target.value) }))}
            />
          </Field>
          <Button onClick={saveEdit} className="w-fit">
            Lưu thay đổi
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
