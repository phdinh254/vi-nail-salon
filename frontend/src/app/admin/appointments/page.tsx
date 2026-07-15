import { PageHeader } from "@/components/ui/page-header";
import { AdminAppointmentsClient } from "@/app/admin/appointments/admin-appointments-client";
import { appointments } from "@/fixtures/appointments";

export default function AdminAppointmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Quản lý lịch hẹn" description="Xem, phân công và cập nhật trạng thái lịch hẹn toàn tiệm." />
      <AdminAppointmentsClient initialAppointments={appointments} />
    </div>
  );
}
