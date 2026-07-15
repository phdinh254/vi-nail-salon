import { CalendarCheck, Users, ListTodo, Bell } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { TodayScheduleClient } from "@/app/staff/dashboard/today-schedule-client";
import { demoStaffSession } from "@/fixtures/session";
import { getAppointmentsByStaffId } from "@/fixtures/appointments";
import { staffNotifications } from "@/fixtures/notifications";
import { formatTimeVN } from "@/utils/format";

const activeStatuses = ["CONFIRMED", "CHECKED_IN", "IN_SERVICE"];

export default function StaffDashboardPage() {
  const staffId = demoStaffSession.staffId as string;
  const allAppointments = getAppointmentsByStaffId(staffId);
  // Fixture "hôm nay" cố định theo dữ liệu minh họa, không phụ thuộc ngày hệ thống thực tế.
  const todaysAppointments = allAppointments.filter((a) => new Date(a.startAt).toDateString() === new Date("2026-07-15").toDateString());
  const remaining = todaysAppointments.filter((a) => activeStatuses.includes(a.status));
  const next = remaining[0];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={`Chào ${demoStaffSession.name}`} description="Lịch làm việc hôm nay của bạn." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Khách tiếp theo" value={next ? formatTimeVN(new Date(next.startAt)) : "—"} icon={Users} trend={next ? next.customerName : "Chưa có lịch tiếp theo"} />
        <StatCard label="Lịch còn lại hôm nay" value={String(remaining.length)} icon={ListTodo} />
        <StatCard label="Thông báo chưa đọc" value={String(staffNotifications.filter((n) => !n.isRead).length)} icon={Bell} />
      </div>

      <section>
        <h2 className="text-h3 font-serif font-semibold text-text">Lịch làm việc hôm nay</h2>
        {todaysAppointments.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={CalendarCheck} title="Không có lịch hẹn nào hôm nay" />
          </div>
        ) : (
          <div className="mt-4">
            <TodayScheduleClient appointments={todaysAppointments} />
          </div>
        )}
      </section>

      <section>
        <h2 className="text-h3 font-serif font-semibold text-text">Thông báo thay đổi lịch</h2>
        <ul className="mt-4 flex flex-col gap-2.5">
          {staffNotifications.map((noti) => (
            <li key={noti.id} className="rounded-lg border border-border bg-surface p-4">
              <p className="text-body-sm font-medium text-text">{noti.title}</p>
              <p className="text-caption text-text-muted">{noti.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
