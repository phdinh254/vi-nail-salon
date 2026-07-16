"use client";

import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  UserX,
  XCircle,
  Wallet,
  AlertTriangle,
  Users2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/use-api";
import { listAllAppointments } from "@/services/appointment.service";
import { listStaff, listServices } from "@/services/catalog.service";
import { appointmentStatusLabel, type AppointmentStatus } from "@/types/appointment";
import { formatCurrencyVND, formatTimeVN } from "@/utils/format";

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export default function AdminDashboardPage() {
  const today = new Date();
  const appointmentsState = useApi(listAllAppointments, []);
  const staffState = useApi(listStaff, []);
  const servicesState = useApi(listServices, []);

  const isLoading = appointmentsState.isLoading || staffState.isLoading || servicesState.isLoading;
  const error = appointmentsState.error ?? staffState.error ?? servicesState.error;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="Tổng quan" description="Hoạt động của tiệm hôm nay." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="Tổng quan" description="Hoạt động của tiệm hôm nay." />
        <p className="text-body-sm text-error">{error}</p>
      </div>
    );
  }

  const appointments = appointmentsState.data ?? [];
  const staffMembers = staffState.data ?? [];
  const services = servicesState.data ?? [];

  const todayAppointments = appointments.filter((a) => isSameDay(new Date(a.startAt), today));
  const pending = todayAppointments.filter((a) => a.status === "PENDING_CONFIRMATION");
  const cancelled = appointments.filter((a) => a.status === "CANCELLED" && isSameDay(new Date(a.startAt), today));
  const noShow = appointments.filter((a) => a.status === "NO_SHOW" && isSameDay(new Date(a.startAt), today));
  const upcomingToday = todayAppointments
    .filter((a) => ["CONFIRMED", "CHECKED_IN"].includes(a.status))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const revenueToday = todayAppointments
    .filter((a) => a.status === "COMPLETED")
    .reduce((sum, a) => sum + a.totalPrice, 0);
  const revenueMonth = appointments
    .filter((a) => a.status === "COMPLETED" && new Date(a.startAt).getMonth() === today.getMonth())
    .reduce((sum, a) => sum + a.totalPrice, 0);

  const statusCounts = todayAppointments.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});
  const maxCount = Math.max(1, ...Object.values(statusCounts));

  const featuredServices = services.filter((s) => s.isFeatured).slice(0, 4);

  const staffToday = staffMembers.map((staff) => ({
    staff,
    count: todayAppointments.filter((a) => a.staffId === staff.id).length,
  }));

  const dateLabel = today.toLocaleDateString("vi-VN");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Tổng quan" description={`Hoạt động của tiệm hôm nay, ${dateLabel}.`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lịch hôm nay" value={String(todayAppointments.length)} icon={CalendarCheck} />
        <StatCard label="Chờ xác nhận" value={String(pending.length)} icon={CalendarClock} tone="warning" />
        <StatCard label="Lịch bị hủy" value={String(cancelled.length)} icon={XCircle} tone="error" />
        <StatCard label="Khách không đến" value={String(noShow.length)} icon={UserX} tone="error" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Doanh thu hôm nay" value={formatCurrencyVND(revenueToday)} icon={Wallet} tone="success" trend="Tính trên lịch đã hoàn thành" />
        <StatCard label="Doanh thu tháng này" value={formatCurrencyVND(revenueMonth)} icon={Wallet} tone="success" />
      </div>

      {pending.length > 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning-bg p-4 text-body-sm text-warning">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">{pending.length} lịch hẹn đang chờ xác nhận</p>
            <Link href="/admin/appointments" className="underline">
              Xem và xác nhận ngay
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-h3 font-serif font-semibold text-text">Khách sắp đến hôm nay</h2>
          {upcomingToday.length === 0 ? (
            <p className="mt-3 text-body-sm text-text-muted">Không có khách sắp đến.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {upcomingToday.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3.5">
                  <div>
                    <p className="text-body-sm font-medium text-text">{a.customerName}</p>
                    <p className="text-caption text-text-muted">{formatTimeVN(new Date(a.startAt))} · {a.staffName ?? "Chưa phân công"}</p>
                  </div>
                  <Badge tone="info">{appointmentStatusLabel[a.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-h3 font-serif font-semibold text-text">Phân bố trạng thái hôm nay</h2>
          <div className="mt-3 flex flex-col gap-2.5">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-caption text-text-muted">
                  {appointmentStatusLabel[status as AppointmentStatus]}
                </span>
                <div className="h-2.5 flex-1 rounded-full bg-bg-subtle">
                  <div
                    className="h-2.5 rounded-full bg-primary"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-caption text-text-muted">{count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-h3 font-serif font-semibold text-text">Dịch vụ nổi bật</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {featuredServices.map((service) => (
              <li key={service.id} className="rounded-lg border border-border bg-surface p-3.5">
                <p className="text-body-sm font-medium text-text">{service.name}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-h3 font-serif font-semibold text-text">Lịch làm việc nhân viên hôm nay</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {staffToday.map(({ staff, count }) => (
              <li key={staff.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3.5">
                <span className="inline-flex items-center gap-2 text-body-sm text-text">
                  <Users2 className="size-4 text-primary" aria-hidden="true" />
                  {staff.name}
                </span>
                <span className="text-caption text-text-muted">{count} lịch hẹn</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
