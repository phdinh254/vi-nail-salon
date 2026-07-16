"use client";

import { CheckCircle2, UserX, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/stores/auth-store";
import { useApi } from "@/hooks/use-api";
import { listAppointmentsByStaff } from "@/services/appointment.service";
import { listServices } from "@/services/catalog.service";
import { serviceCategoryLabel } from "@/types/service";
import { formatCurrencyVND } from "@/utils/format";

export default function StaffPerformancePage() {
  const { user } = useAuth();
  const {
    data: appointments,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
  } = useApi(listAppointmentsByStaff, [], { enabled: Boolean(user) });
  const { data: services } = useApi(listServices, [], { enabled: Boolean(user) });

  const isLoading = isLoadingAppointments;
  const list = appointments ?? [];
  const completed = list.filter((a) => a.status === "COMPLETED");
  const noShow = list.filter((a) => a.status === "NO_SHOW");
  const upcoming = list.filter((a) => ["PENDING_CONFIRMATION", "CONFIRMED"].includes(a.status));
  const totalRevenue = completed.reduce((sum, a) => sum + a.totalPrice, 0);

  const serviceCategoryById = new Map((services ?? []).map((s) => [s.id, s.category]));
  const categoryCounts = new Map<string, number>();
  for (const appointment of list) {
    for (const line of appointment.services) {
      const category = serviceCategoryById.get(line.serviceId);
      if (!category) continue;
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
  }
  const topCategory = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Hiệu suất cá nhân" description="Số liệu dựa trên lịch hẹn được phân công cho bạn." />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : appointmentsError ? (
        <EmptyState title="Không thể tải số liệu hiệu suất" description={appointmentsError} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Đã hoàn thành" value={String(completed.length)} icon={CheckCircle2} tone="success" />
            <StatCard label="Khách không đến" value={String(noShow.length)} icon={UserX} tone="error" />
            <StatCard label="Lịch sắp tới" value={String(upcoming.length)} icon={CalendarClock} />
          </div>

          {topCategory ? (
            <div className="rounded-lg border border-border bg-surface p-5">
              <p className="text-label text-text">Nhóm dịch vụ thực hiện nhiều nhất</p>
              <p className="mt-1.5 text-h3 font-serif font-semibold text-text">
                {serviceCategoryLabel[topCategory[0] as keyof typeof serviceCategoryLabel]}
              </p>
              <p className="text-caption text-text-muted">{topCategory[1]} lượt thực hiện</p>
            </div>
          ) : null}

          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-label text-text">Doanh thu từ lịch hẹn đã hoàn thành</p>
            <p className="mt-1.5 text-h3 font-serif font-semibold text-text">{formatCurrencyVND(totalRevenue)}</p>
            <p className="text-caption text-text-muted">Tỷ lệ hoa hồng sẽ hiển thị tại đây khi hệ thống thanh toán được kết nối.</p>
          </div>
        </>
      )}
    </div>
  );
}
