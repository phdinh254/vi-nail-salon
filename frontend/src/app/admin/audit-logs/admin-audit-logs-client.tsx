"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { AuditLogEntry } from "@/types/audit-log";
import { formatDateShortVN, formatTimeVN } from "@/utils/format";

export function AdminAuditLogsClient({ logs }: { logs: AuditLogEntry[] }) {
  const [query, setQuery] = useState("");
  const [actorRole, setActorRole] = useState("ALL");

  const actors = useMemo(() => Array.from(new Set(logs.map((l) => l.actorName))), [logs]);
  const [actor, setActor] = useState("ALL");

  const filtered = useMemo(
    () =>
      logs.filter((log) => {
        const matchesQuery =
          log.action.toLowerCase().includes(query.toLowerCase()) || log.resourceLabel.toLowerCase().includes(query.toLowerCase());
        const matchesRole = actorRole === "ALL" || log.actorRole === actorRole;
        const matchesActor = actor === "ALL" || log.actorName === actor;
        return matchesQuery && matchesRole && matchesActor;
      }),
    [logs, query, actorRole, actor],
  );

  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      header: "Thời gian",
      cell: (l) => `${formatDateShortVN(new Date(l.createdAt))} ${formatTimeVN(new Date(l.createdAt))}`,
    },
    {
      header: "Người thực hiện",
      cell: (l) => (
        <span>
          {l.actorName} <Badge tone="neutral">{l.actorRole}</Badge>
        </span>
      ),
    },
    { header: "Hành động", cell: (l) => l.action },
    { header: "Tài nguyên", cell: (l) => `${l.resourceType} · ${l.resourceLabel}` },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput placeholder="Tìm theo hành động hoặc tài nguyên..." value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
        <Select value={actor} onChange={(e) => setActor(e.target.value)} className="sm:max-w-xs" aria-label="Lọc theo người thực hiện">
          <option value="ALL">Tất cả người thực hiện</option>
          {actors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
        <Select value={actorRole} onChange={(e) => setActorRole(e.target.value)} className="sm:max-w-xs" aria-label="Lọc theo vai trò">
          <option value="ALL">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị viên</option>
          <option value="STAFF">Nhân viên</option>
          <option value="SYSTEM">Hệ thống</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Không tìm thấy nhật ký phù hợp" />
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}
    </div>
  );
}
