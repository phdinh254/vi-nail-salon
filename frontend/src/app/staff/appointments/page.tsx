import { PageHeader } from "@/components/ui/page-header";
import { StaffAppointmentsList } from "@/app/staff/appointments/appointments-list";
import { demoStaffSession } from "@/fixtures/session";
import { getAppointmentsByStaffId } from "@/fixtures/appointments";

export default function StaffAppointmentsPage() {
  const appointments = getAppointmentsByStaffId(demoStaffSession.staffId as string);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Lịch hẹn của tôi" description="Chỉ hiển thị lịch hẹn được phân công cho bạn." />
      <StaffAppointmentsList appointments={appointments} />
    </div>
  );
}
