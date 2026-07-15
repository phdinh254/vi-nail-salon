import { PageHeader } from "@/components/ui/page-header";
import { CustomerAppointmentsList } from "@/app/customer/appointments/appointments-list";
import { demoCustomerSession } from "@/fixtures/session";
import { getAppointmentsByPhone } from "@/fixtures/appointments";

export default function CustomerAppointmentsPage() {
  const appointments = getAppointmentsByPhone(demoCustomerSession.phone);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Lịch hẹn của tôi" description="Theo dõi trạng thái và lịch sử các lượt hẹn." />
      <CustomerAppointmentsList appointments={appointments} />
    </div>
  );
}
