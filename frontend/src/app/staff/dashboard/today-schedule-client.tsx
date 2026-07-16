"use client";

import { useState } from "react";
import Link from "next/link";
import { DoorOpen, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { updateAppointmentStatus } from "@/services/appointment.service";
import { ApiError } from "@/lib/api-client";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import { formatTimeVN, maskPhoneNumber } from "@/utils/format";

export function TodayScheduleClient({
  appointments,
  onUpdated,
}: {
  appointments: Appointment[];
  onUpdated?: () => void;
}) {
  const { showToast } = useToast();
  const [statusOverrides, setStatusOverrides] = useState<Record<string, AppointmentStatus>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);

  function currentStatus(appointment: Appointment) {
    return statusOverrides[appointment.id] ?? appointment.status;
  }

  async function advance(appointment: Appointment, next: AppointmentStatus, label: string) {
    setPendingId(appointment.id);
    try {
      await updateAppointmentStatus(appointment.id, next);
      setStatusOverrides((prev) => ({ ...prev, [appointment.id]: next }));
      showToast({ variant: "success", title: label, description: `Lịch hẹn ${appointment.code} đã được cập nhật.` });
      onUpdated?.();
    } catch (err) {
      showToast({
        variant: "error",
        title: "Cập nhật thất bại",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {appointments.map((appointment) => {
        const status = currentStatus(appointment);
        return (
          <li key={appointment.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-body-sm font-semibold text-text">
                {formatTimeVN(new Date(appointment.startAt))} · {appointment.customerName}
              </p>
              <StatusBadge status={status} />
            </div>
            <p className="mt-1 text-caption text-text-muted">
              {appointment.services.map((s) => s.serviceName).join(", ")} · {maskPhoneNumber(appointment.customerPhone)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <Link href={`/staff/appointments/${appointment.id}`} className="text-body-sm font-medium text-primary hover:underline">
                Xem chi tiết
              </Link>
              {status === "CONFIRMED" ? (
                <Button
                  size="sm"
                  variant="secondary"
                  isLoading={pendingId === appointment.id}
                  onClick={() => advance(appointment, "CHECKED_IN", "Đã check-in")}
                >
                  <DoorOpen className="size-4" aria-hidden="true" />
                  Check-in
                </Button>
              ) : null}
              {status === "CHECKED_IN" ? (
                <Button
                  size="sm"
                  isLoading={pendingId === appointment.id}
                  onClick={() => advance(appointment, "IN_SERVICE", "Đã bắt đầu phục vụ")}
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  Bắt đầu phục vụ
                </Button>
              ) : null}
              {status === "IN_SERVICE" ? (
                <Button
                  size="sm"
                  variant="secondary"
                  isLoading={pendingId === appointment.id}
                  onClick={() => advance(appointment, "COMPLETED", "Đã hoàn thành")}
                >
                  Hoàn thành
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
