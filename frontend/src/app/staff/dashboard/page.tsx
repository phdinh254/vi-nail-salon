"use client";

import { CalendarCheck, Users, ListTodo, Bell } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TodayScheduleClient } from "@/app/staff/dashboard/today-schedule-client";
import { useAuth } from "@/stores/auth-store";
import { useApi } from "@/hooks/use-api";
import { listAppointmentsByStaff } from "@/services/appointment.service";
import { listStaffNotifications } from "@/services/notification.service";
import { formatTimeVN } from "@/utils/format";

const activeStatuses = ["CONFIRMED", "CHECKED_IN", "IN_SERVICE"];

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const {
    data: appointments,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useApi(listAppointmentsByStaff, [], { enabled: Boolean(user) });
  const { data: notifications, isLoading: isLoadingNotifications } = useApi(listStaffNotifications, [], {
    enabled: Boolean(user),
  });

  const allAppointments = appointments ?? [];
  const todaysAppointments = allAppointments.filter(
    (a) => new Date(a.startAt).toDateString() === new Date().toDateString(),
  );
  const remaining = todaysAppointments.filter((a) => activeStatuses.includes(a.status));
  const next = remaining[0];
  const notificationList = notifications ?? [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={`Chào ${user?.name ?? ""}`} description="Lịch làm việc hôm nay của bạn." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Khách tiếp theo"
          value={next ? formatTimeVN(new Date(next.startAt)) : "—"}
          icon={Users}
          trend={next ? next.customerName : "Chưa có lịch tiếp theo"}
        />
        <StatCard label="Lịch còn lại hôm nay" value={String(remaining.length)} icon={ListTodo} />
        <StatCard
          label="Thông báo chưa đọc"
          value={String(notificationList.filter((n) => !n.isRead).length)}
          icon={Bell}
        />
      </div>

      <section>
        <h2 className="text-h3 font-serif font-semibold text-text">Lịch làm việc hôm nay</h2>
        {isLoadingAppointments ? (
          <div className="mt-4 flex flex-col gap-2.5">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : appointmentsError ? (
          <div className="mt-4">
            <EmptyState icon={CalendarCheck} title="Không thể tải lịch hẹn" description={appointmentsError} />
          </div>
        ) : todaysAppointments.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={CalendarCheck} title="Không có lịch hẹn nào hôm nay" />
          </div>
        ) : (
          <div className="mt-4">
            <TodayScheduleClient appointments={todaysAppointments} onUpdated={refetchAppointments} />
          </div>
        )}
      </section>

      <section>
        <h2 className="text-h3 font-serif font-semibold text-text">Thông báo thay đổi lịch</h2>
        {isLoadingNotifications ? (
          <div className="mt-4 flex flex-col gap-2.5">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : notificationList.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Chưa có thông báo nào" />
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2.5">
            {notificationList.map((noti) => (
              <li key={noti.id} className="rounded-lg border border-border bg-surface p-4">
                <p className="text-body-sm font-medium text-text">{noti.title}</p>
                <p className="text-caption text-text-muted">{noti.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
