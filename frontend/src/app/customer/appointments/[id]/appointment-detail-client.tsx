"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, User, Wallet, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/providers/toast-provider";
import { canModifyStatuses } from "@/features/guest-booking/lookup";
import { guestCancel } from "@/services/appointment.service";
import { ApiError } from "@/lib/api-client";
import type { Appointment } from "@/types/appointment";
import { formatCurrencyVND, formatDateVN, formatDurationMinutes, formatTimeVN } from "@/utils/format";

export function AppointmentDetailClient({
  appointment,
  onCancelled,
}: {
  appointment: Appointment;
  onCancelled?: () => void;
}) {
  const { showToast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canModify = canModifyStatuses.includes(appointment.status);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Lịch hẹn ${appointment.code}`} actions={<StatusBadge status={appointment.status} />} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-surface p-6">
          <p className="text-label text-text">Dịch vụ</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {appointment.services.map((s) => (
              <li key={s.serviceId} className="flex items-center justify-between text-body-sm">
                <span className="text-text">{s.serviceName}</span>
                <span className="text-text-muted">{formatCurrencyVND(s.price)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 flex flex-col gap-2.5 border-t border-border pt-5 text-body-sm">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="size-4.5 text-primary" aria-hidden="true" />
              <dd className="text-text">
                {formatDateVN(new Date(appointment.startAt))} · {formatTimeVN(new Date(appointment.startAt))} - {formatTimeVN(new Date(appointment.endAt))}
              </dd>
            </div>
            <div className="flex items-center gap-2.5">
              <User className="size-4.5 text-primary" aria-hidden="true" />
              <dd className="text-text">{appointment.staffName ?? "Đang chờ phân công"}</dd>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="size-4.5 text-primary" aria-hidden="true" />
              <dd className="text-text">{formatDurationMinutes(appointment.totalDurationMinutes)}</dd>
            </div>
            <div className="flex items-center gap-2.5">
              <Wallet className="size-4.5 text-primary" aria-hidden="true" />
              <dd className="font-semibold text-primary">{formatCurrencyVND(appointment.totalPrice)}</dd>
            </div>
          </dl>

          {appointment.allergyNote || appointment.requestNote ? (
            <div className="mt-5 border-t border-border pt-5 text-body-sm text-text-muted">
              {appointment.allergyNote ? (
                <p className="flex items-start gap-2 text-warning">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  Dị ứng: {appointment.allergyNote}
                </p>
              ) : null}
              {appointment.requestNote ? <p className="mt-1.5">Ghi chú: {appointment.requestNote}</p> : null}
            </div>
          ) : null}

          {canModify ? (
            <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
              <Button
                variant="secondary"
                onClick={() =>
                  showToast({
                    variant: "info",
                    title: "Đổi lịch hẹn",
                    description: "Vui lòng liên hệ tiệm hoặc dùng trang tra cứu lịch hẹn để đổi lịch.",
                  })
                }
              >
                Đổi lịch hẹn
              </Button>
              <Button variant="destructive" onClick={() => setDialogOpen(true)}>
                Hủy lịch hẹn
              </Button>
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-bg-subtle p-5">
          <p className="text-label text-text">Lịch sử trạng thái</p>
          <ol className="mt-3 flex flex-col gap-3">
            {appointment.timeline.map((entry) => (
              <li key={entry.at} className="flex flex-col gap-1">
                <StatusBadge status={entry.status} />
                <span className="text-caption text-text-muted">
                  {formatDateVN(new Date(entry.at))} · {formatTimeVN(new Date(entry.at))}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <Link href="/customer/appointments" className="text-body-sm font-medium text-primary hover:underline">
        ← Quay lại danh sách lịch hẹn
      </Link>

      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={async () => {
          setIsSubmitting(true);
          try {
            await guestCancel(appointment.code, appointment.customerPhone);
            showToast({
              variant: "success",
              title: "Đã hủy lịch hẹn",
              description: `Lịch hẹn ${appointment.code} đã được hủy.`,
            });
            onCancelled?.();
          } catch (err) {
            showToast({
              variant: "error",
              title: "Không thể hủy lịch hẹn",
              description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
            });
          } finally {
            setIsSubmitting(false);
            setDialogOpen(false);
          }
        }}
        title="Xác nhận hủy lịch hẹn"
        description="Bạn sẽ không thể hoàn tác thao tác này."
        confirmLabel="Xác nhận hủy"
        destructive
        isLoading={isSubmitting}
      />
    </div>
  );
}
