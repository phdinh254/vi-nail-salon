import Link from "next/link";
import { CalendarDays, Clock, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Appointment } from "@/types/appointment";
import { formatCurrencyVND, formatDateVN, formatTimeVN } from "@/utils/format";

export function AppointmentCard({
  appointment,
  href,
  showPrice = true,
}: {
  appointment: Appointment;
  href: string;
  showPrice?: boolean;
}) {
  const start = new Date(appointment.startAt);
  const end = new Date(appointment.endAt);

  return (
    <Link
      href={href}
      className="block rounded-lg border border-border bg-surface p-5 shadow-soft-sm transition-shadow duration-base hover:shadow-soft-md"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-caption font-medium text-text-muted">Mã lịch hẹn {appointment.code}</p>
        <StatusBadge status={appointment.status} />
      </div>
      <p className="mt-2 text-body font-semibold text-text">
        {appointment.services.map((s) => s.serviceName).join(", ")}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-body-sm text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4" aria-hidden="true" />
          {formatDateVN(start)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden="true" />
          {formatTimeVN(start)} - {formatTimeVN(end)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <User className="size-4" aria-hidden="true" />
          {appointment.staffName ?? "Chờ phân công"}
        </span>
      </div>
      {showPrice ? (
        <p className="mt-3 text-body-sm font-semibold text-primary">
          {formatCurrencyVND(appointment.totalPrice)}
        </p>
      ) : null}
    </Link>
  );
}
