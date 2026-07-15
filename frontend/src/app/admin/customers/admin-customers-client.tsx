"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import type { AdminCustomer } from "@/types/customer";
import { getAppointmentsByPhone } from "@/fixtures/appointments";
import { formatDateVN, formatTimeVN } from "@/utils/format";

export function AdminCustomersClient({ customers }: { customers: AdminCustomer[] }) {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<AdminCustomer | null>(null);

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query),
      ),
    [customers, query],
  );

  const columns: DataTableColumn<AdminCustomer>[] = [
    { header: "Tên", cell: (c) => <span className="font-medium">{c.name}</span> },
    { header: "Số điện thoại", cell: (c) => c.phone },
    {
      header: "Loại tài khoản",
      cell: (c) => <Badge tone={c.accountType === "CUSTOMER" ? "primary" : "neutral"}>{c.accountType === "CUSTOMER" ? "Đã có tài khoản" : "Khách vãng lai"}</Badge>,
    },
    { header: "Số lần đến", cell: (c) => `${c.totalVisits} lượt` },
    { header: "Lần gần nhất", cell: (c) => (c.lastVisitAt ? formatDateVN(new Date(c.lastVisitAt)) : "—") },
    {
      header: "Lịch sử",
      cell: (c) => (
        <button type="button" onClick={() => setTarget(c)} className="text-body-sm font-medium text-primary hover:underline">
          Xem lịch sử
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <SearchInput
        placeholder="Tìm theo tên hoặc số điện thoại..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="sm:max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Không tìm thấy khách hàng phù hợp" />
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}

      <Dialog
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title={target?.name ?? ""}
        description={target ? `${target.phone} · ${target.totalVisits} lượt đến` : undefined}
      >
        {target ? (
          <>
            {target.note ? <p className="mb-4 rounded-md bg-bg-subtle p-3 text-body-sm text-text-muted">Ghi chú: {target.note}</p> : null}
            <ul className="flex flex-col gap-2.5">
              {getAppointmentsByPhone(target.phone).map((appointment) => (
                <li key={appointment.id} className="flex items-center justify-between text-body-sm">
                  <span className="text-text">
                    {formatDateVN(new Date(appointment.startAt))} · {formatTimeVN(new Date(appointment.startAt))}
                  </span>
                  <StatusBadge status={appointment.status} />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Dialog>
    </div>
  );
}
