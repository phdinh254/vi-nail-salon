"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Search } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/providers/toast-provider";
import { useApi } from "@/hooks/use-api";
import { listAllAppointments, updateAppointmentStatus, assignStaff as assignStaffApi } from "@/services/appointment.service";
import { listStaff } from "@/services/catalog.service";
import { ApiError } from "@/lib/api-client";
import { CreateAppointmentDialog } from "./create-appointment-dialog";
import {
  APPOINTMENT_STATUSES,
  appointmentStatusLabel,
  type Appointment,
  type AppointmentStatus,
} from "@/types/appointment";
import { formatCurrencyVND, formatDateShortVN, formatTimeVN } from "@/utils/format";

export function AdminAppointmentsClient() {
  const { showToast } = useToast();
  const appointmentsState = useApi(listAllAppointments, []);
  const staffState = useApi(listStaff, []);
  const staffMembers = staffState.data ?? [];
  const appointments = useMemo(() => appointmentsState.data ?? [], [appointmentsState.data]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [view, setView] = useState("list");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Appointment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchesQuery =
        a.customerName.toLowerCase().includes(query.toLowerCase()) ||
        a.customerPhone.includes(query) ||
        a.code.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [appointments, query, statusFilter]);

  async function updateStatus(id: string, status: AppointmentStatus, label: string) {
    try {
      await updateAppointmentStatus(id, status);
      showToast({ variant: "success", title: label });
      appointmentsState.refetch();
    } catch (err) {
      showToast({
        variant: "error",
        title: "Không thể cập nhật trạng thái",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  }

  async function assignStaff(id: string, staffId: string, staffName: string) {
    try {
      await assignStaffApi(id, staffId);
      showToast({ variant: "success", title: "Đã phân công nhân viên", description: staffName });
      appointmentsState.refetch();
    } catch (err) {
      showToast({
        variant: "error",
        title: "Không thể phân công nhân viên",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  }

  const columns: DataTableColumn<Appointment>[] = [
    { header: "Mã", cell: (a) => <span className="font-medium">{a.code}</span> },
    {
      header: "Thời gian",
      cell: (a) => (
        <span>
          {formatDateShortVN(new Date(a.startAt))} · {formatTimeVN(new Date(a.startAt))}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      cell: (a) => (
        <span>
          {a.customerName}
          <br />
          <span className="text-caption text-text-muted">{a.customerPhone}</span>
        </span>
      ),
    },
    { header: "Dịch vụ", cell: (a) => a.services.map((s) => s.serviceName).join(", ") },
    {
      header: "Nhân viên",
      cell: (a) => (
        <DropdownMenu
          trigger={<span className="text-body-sm text-primary hover:underline">{a.staffName ?? "Phân công"}</span>}
          items={staffMembers.map((staff) => ({ label: staff.name, onSelect: () => assignStaff(a.id, staff.id, staff.name) }))}
        />
      ),
    },
    { header: "Trạng thái", cell: (a) => <StatusBadge status={a.status} /> },
    { header: "Giá", cell: (a) => formatCurrencyVND(a.totalPrice) },
    {
      header: "Thao tác",
      cell: (a) => (
        <DropdownMenu
          align="end"
          trigger={<span className="text-body-sm text-primary hover:underline">Thao tác</span>}
          items={[
            { label: "Xem lịch sử trạng thái", onSelect: () => setHistoryTarget(a) },
            ...(a.status === "PENDING_CONFIRMATION"
              ? [{ label: "Xác nhận lịch", onSelect: () => updateStatus(a.id, "CONFIRMED" as AppointmentStatus, "Đã xác nhận lịch hẹn") }]
              : []),
            ...(a.status === "CONFIRMED"
              ? [{ label: "Check-in khách", onSelect: () => updateStatus(a.id, "CHECKED_IN" as AppointmentStatus, "Đã check-in") }]
              : []),
            ...(["PENDING_CONFIRMATION", "CONFIRMED"].includes(a.status)
              ? [{ label: "Hủy lịch hẹn", onSelect: () => setCancelTarget(a), destructive: true }]
              : []),
          ]}
        />
      ),
    },
  ];

  if (appointmentsState.isLoading || staffState.isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (appointmentsState.error) {
    return <p className="text-body-sm text-error">{appointmentsState.error}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onChange={setView} items={[{ value: "list", label: "Danh sách" }, { value: "calendar", label: "Lịch ngày" }]} />
        <Button onClick={() => setCreateOpen(true)}>
          <CalendarPlus className="size-4" aria-hidden="true" />
          Tạo lịch hộ khách
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          placeholder="Tìm theo tên, số điện thoại, mã lịch hẹn..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-sm"
        />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:max-w-xs" aria-label="Lọc theo trạng thái">
          <option value="ALL">Tất cả trạng thái</option>
          {APPOINTMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {appointmentStatusLabel[status]}
            </option>
          ))}
        </Select>
      </div>

      {view === "list" ? (
        filtered.length === 0 ? (
          <EmptyState icon={Search} title="Không tìm thấy lịch hẹn phù hợp" />
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )
      ) : (
        <CalendarDayView appointments={filtered} />
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (!cancelTarget) return;
          updateStatus(cancelTarget.id, "CANCELLED", "Đã hủy lịch hẹn");
          setCancelTarget(null);
        }}
        title="Xác nhận hủy lịch hẹn"
        description={cancelTarget ? `Hủy lịch hẹn ${cancelTarget.code} của khách ${cancelTarget.customerName}?` : undefined}
        destructive
        confirmLabel="Xác nhận hủy"
      />

      <Dialog
        open={Boolean(historyTarget)}
        onClose={() => setHistoryTarget(null)}
        title="Lịch sử trạng thái"
        description={historyTarget?.code}
      >
        <ol className="flex flex-col gap-3">
          {historyTarget?.timeline.map((entry) => (
            <li key={entry.at} className="flex items-center justify-between text-body-sm">
              <StatusBadge status={entry.status} />
              <span className="text-caption text-text-muted">
                {formatDateShortVN(new Date(entry.at))} {formatTimeVN(new Date(entry.at))}
              </span>
            </li>
          ))}
        </ol>
      </Dialog>

      <CreateAppointmentDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => appointmentsState.refetch()}
      />
    </div>
  );
}

function CalendarDayView({ appointments }: { appointments: Appointment[] }) {
  const sorted = [...appointments].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  if (sorted.length === 0) return <EmptyState title="Không có lịch hẹn để hiển thị" />;
  return (
    <div className="rounded-lg border border-border bg-surface">
      <ul className="divide-y divide-border">
        {sorted.map((a) => (
          <li key={a.id} className="flex items-center gap-4 p-4">
            <span className="w-16 shrink-0 text-body-sm font-semibold text-primary">{formatTimeVN(new Date(a.startAt))}</span>
            <span className="flex-1 text-body-sm text-text">
              {a.customerName} · {a.services.map((s) => s.serviceName).join(", ")}
            </span>
            <StatusBadge status={a.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

