"use client";

import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/stores/auth-store";
import { useApi } from "@/hooks/use-api";
import { listAppointmentsByStaff } from "@/services/appointment.service";
import { formatDateVN, maskPhoneNumber } from "@/utils/format";

export default function StaffCustomersPage() {
  const { user } = useAuth();
  const { data: appointments, isLoading, error } = useApi(listAppointmentsByStaff, [], {
    enabled: Boolean(user),
  });

  const list = appointments ?? [];
  const byPhone = new Map<string, { name: string; phone: string; visits: number; lastVisit: Date; lastService: string }>();
  for (const appointment of list) {
    const existing = byPhone.get(appointment.customerPhone);
    const startAt = new Date(appointment.startAt);
    if (!existing || startAt > existing.lastVisit) {
      byPhone.set(appointment.customerPhone, {
        name: appointment.customerName,
        phone: appointment.customerPhone,
        visits: (existing?.visits ?? 0) + 1,
        lastVisit: startAt,
        lastService: appointment.services.map((s) => s.serviceName).join(", "),
      });
    } else {
      byPhone.set(appointment.customerPhone, { ...existing, visits: existing.visits + 1 });
    }
  }
  const customers = Array.from(byPhone.values()).sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Khách hàng đã phục vụ" description="Danh sách khách hàng trong các lịch hẹn được phân công cho bạn." />

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <EmptyState title="Không thể tải danh sách khách hàng" description={error} />
      ) : customers.length === 0 ? (
        <EmptyState title="Chưa có khách hàng nào" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <ul className="divide-y divide-border">
            {customers.map((customer) => (
              <li key={customer.phone} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="text-body-sm font-medium text-text">{customer.name}</p>
                  <p className="text-caption text-text-muted">{maskPhoneNumber(customer.phone)} · {customer.lastService}</p>
                </div>
                <div className="text-right">
                  <p className="text-body-sm text-text">{customer.visits} lượt</p>
                  <p className="text-caption text-text-muted">Gần nhất: {formatDateVN(customer.lastVisit)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
