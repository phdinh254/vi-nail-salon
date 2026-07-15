import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Clock, Phone, AlertTriangle, StickyNote } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAppointmentById } from "@/fixtures/appointments";
import { getNailDesignById } from "@/fixtures/nail-designs";
import { demoStaffSession } from "@/fixtures/session";
import { formatDateVN, formatDurationMinutes, formatTimeVN, maskPhoneNumber } from "@/utils/format";

export default async function StaffAppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appointment = getAppointmentById(id);
  if (!appointment || appointment.staffId !== demoStaffSession.staffId) notFound();

  const nailDesign = appointment.nailDesignId ? getNailDesignById(appointment.nailDesignId) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={appointment.customerName} actions={<StatusBadge status={appointment.status} />} />

      <div className="max-w-2xl rounded-lg border border-border bg-surface p-6">
        <dl className="flex flex-col gap-3 text-body-sm">
          <div className="flex items-center gap-2.5">
            <Phone className="size-4.5 text-primary" aria-hidden="true" />
            <dd className="text-text">{maskPhoneNumber(appointment.customerPhone)}</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <CalendarDays className="size-4.5 text-primary" aria-hidden="true" />
            <dd className="text-text">
              {formatDateVN(new Date(appointment.startAt))} · {formatTimeVN(new Date(appointment.startAt))} - {formatTimeVN(new Date(appointment.endAt))}
            </dd>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="size-4.5 text-primary" aria-hidden="true" />
            <dd className="text-text">{formatDurationMinutes(appointment.totalDurationMinutes)}</dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-border pt-5">
          <p className="text-label text-text">Dịch vụ</p>
          <ul className="mt-2 flex flex-col gap-1">
            {appointment.services.map((s) => (
              <li key={s.serviceId} className="text-body-sm text-text">
                {s.serviceName}
              </li>
            ))}
          </ul>
        </div>

        {nailDesign ? (
          <div className="mt-5 border-t border-border pt-5">
            <p className="text-label text-text">Mẫu nail khách chọn</p>
            <p className="mt-1 text-body-sm text-text">{nailDesign.name}</p>
          </div>
        ) : null}

        {appointment.allergyNote ? (
          <div className="mt-5 flex items-start gap-2.5 border-t border-border pt-5 text-body-sm text-warning">
            <AlertTriangle className="mt-0.5 size-4.5 shrink-0" aria-hidden="true" />
            Dị ứng: {appointment.allergyNote}
          </div>
        ) : null}

        {appointment.requestNote ? (
          <div className="mt-5 flex items-start gap-2.5 border-t border-border pt-5 text-body-sm text-text-muted">
            <StickyNote className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden="true" />
            {appointment.requestNote}
          </div>
        ) : null}
      </div>

      <Link href="/staff/appointments" className="text-body-sm font-medium text-primary hover:underline">
        ← Quay lại danh sách
      </Link>
    </div>
  );
}
