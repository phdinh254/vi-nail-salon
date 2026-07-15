import { CheckCircle2, UserX, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { demoStaffSession } from "@/fixtures/session";
import { getAppointmentsByStaffId } from "@/fixtures/appointments";
import { serviceCategoryLabel } from "@/types/service";
import { getServiceById } from "@/fixtures/services";

export default function StaffPerformancePage() {
  const appointments = getAppointmentsByStaffId(demoStaffSession.staffId as string);
  const completed = appointments.filter((a) => a.status === "COMPLETED");
  const noShow = appointments.filter((a) => a.status === "NO_SHOW");
  const upcoming = appointments.filter((a) => ["PENDING_CONFIRMATION", "CONFIRMED"].includes(a.status));

  const categoryCounts = new Map<string, number>();
  for (const appointment of appointments) {
    for (const line of appointment.services) {
      const service = getServiceById(line.serviceId);
      if (!service) continue;
      categoryCounts.set(service.category, (categoryCounts.get(service.category) ?? 0) + 1);
    }
  }
  const topCategory = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Hiệu suất cá nhân" description="Số liệu dựa trên lịch hẹn được phân công cho bạn." />

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

      <p className="text-caption text-text-muted">
        Tỷ lệ hoa hồng và doanh thu cá nhân sẽ hiển thị tại đây khi hệ thống thanh toán được kết nối.
      </p>
    </div>
  );
}
