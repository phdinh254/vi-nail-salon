import { Wallet, CalendarCheck, UserX, Users2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { RevenueTrendChart } from "@/app/admin/reports/reports-client";
import { appointments } from "@/fixtures/appointments";
import { staffMembers } from "@/fixtures/staff";
import { formatCurrencyVND } from "@/utils/format";

const TODAY = new Date("2026-07-15");

export default function AdminReportsPage() {
  const completed = appointments.filter((a) => a.status === "COMPLETED");
  const noShow = appointments.filter((a) => a.status === "NO_SHOW");
  const totalRevenue = completed.reduce((sum, a) => sum + a.totalPrice, 0);

  const serviceStats = new Map<string, { name: string; count: number; revenue: number }>();
  for (const appointment of completed) {
    for (const line of appointment.services) {
      const existing = serviceStats.get(line.serviceId);
      serviceStats.set(line.serviceId, {
        name: line.serviceName,
        count: (existing?.count ?? 0) + 1,
        revenue: (existing?.revenue ?? 0) + line.price,
      });
    }
  }
  const topServices = Array.from(serviceStats.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const maxServiceRevenue = Math.max(1, ...topServices.map((s) => s.revenue));

  const staffStats = staffMembers
    .map((staff) => {
      const staffCompleted = completed.filter((a) => a.staffId === staff.id);
      return {
        staff,
        count: staffCompleted.length,
        revenue: staffCompleted.reduce((sum, a) => sum + a.totalPrice, 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Báo cáo" description="Tổng hợp doanh thu và hiệu suất dựa trên lịch hẹn đã hoàn thành." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng doanh thu" value={formatCurrencyVND(totalRevenue)} icon={Wallet} tone="success" />
        <StatCard label="Lịch đã hoàn thành" value={String(completed.length)} icon={CalendarCheck} />
        <StatCard label="Khách không đến" value={String(noShow.length)} icon={UserX} tone="error" />
        <StatCard label="Nhân viên đang hoạt động" value={String(staffMembers.filter((s) => s.isActive).length)} icon={Users2} />
      </div>

      <section className="rounded-lg border border-border bg-surface p-5">
        <RevenueTrendChart completedAppointments={completed} anchorDate={TODAY} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-h3 font-serif font-semibold text-text">Dịch vụ mang lại doanh thu cao nhất</h2>
          {topServices.length === 0 ? (
            <p className="mt-3 text-body-sm text-text-muted">Chưa có dữ liệu.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {topServices.map((service) => (
                <div key={service.name}>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-text">{service.name}</span>
                    <span className="text-text-muted">{formatCurrencyVND(service.revenue)} · {service.count} lượt</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-bg-subtle">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(service.revenue / maxServiceRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-h3 font-serif font-semibold text-text">Hiệu suất nhân viên</h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            {staffStats.map(({ staff, count, revenue }) => (
              <li key={staff.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3.5">
                <div>
                  <p className="text-body-sm font-medium text-text">{staff.name}</p>
                  <p className="text-caption text-text-muted">{count} lịch hoàn thành</p>
                </div>
                <span className="text-body-sm font-semibold text-primary">{formatCurrencyVND(revenue)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="text-caption text-text-muted">
        Số liệu tính trên dữ liệu minh họa hiện có. Báo cáo theo khoảng ngày tùy chọn và xuất file sẽ bổ sung khi kết
        nối dữ liệu vận hành thật.
      </p>
    </div>
  );
}
