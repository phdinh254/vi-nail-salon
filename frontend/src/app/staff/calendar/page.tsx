import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { demoStaffSession } from "@/fixtures/session";
import { getAppointmentsByStaffId } from "@/fixtures/appointments";
import { formatTimeVN } from "@/utils/format";

const weekdayLabels = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function StaffCalendarPage() {
  const appointments = getAppointmentsByStaffId(demoStaffSession.staffId as string);
  const weekStart = startOfWeek(new Date("2026-07-15"));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Lịch làm việc" description="Xem lịch hẹn theo tuần." />

      <div className="grid gap-3 lg:grid-cols-7">
        {days.map((day) => {
          const dayAppointments = appointments
            .filter((a) => new Date(a.startAt).toDateString() === day.toDateString())
            .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
          const isToday = day.toDateString() === new Date("2026-07-15").toDateString();

          return (
            <div key={day.toISOString()} className="rounded-lg border border-border bg-surface p-3">
              <p className={`text-caption font-semibold ${isToday ? "text-primary" : "text-text-muted"}`}>
                {weekdayLabels[(day.getDay() + 6) % 7]}
              </p>
              <p className="text-body-sm font-medium text-text">
                {day.getDate().toString().padStart(2, "0")}/{(day.getMonth() + 1).toString().padStart(2, "0")}
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {dayAppointments.length === 0 ? (
                  <p className="text-caption text-text-muted">Không có lịch</p>
                ) : (
                  dayAppointments.map((a) => (
                    <div key={a.id} className="rounded-md bg-bg-subtle p-2">
                      <p className="text-caption font-medium text-text">{formatTimeVN(new Date(a.startAt))}</p>
                      <p className="truncate text-caption text-text-muted">{a.customerName}</p>
                      <StatusBadge status={a.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {appointments.length === 0 ? <EmptyState title="Chưa có lịch làm việc nào" /> : null}
    </div>
  );
}
