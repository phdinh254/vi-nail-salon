import { notFound } from "next/navigation";
import { getAppointmentById } from "@/fixtures/appointments";
import { AppointmentDetailClient } from "@/app/customer/appointments/[id]/appointment-detail-client";

export default async function CustomerAppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appointment = getAppointmentById(id);
  if (!appointment) notFound();

  return <AppointmentDetailClient appointment={appointment} />;
}
