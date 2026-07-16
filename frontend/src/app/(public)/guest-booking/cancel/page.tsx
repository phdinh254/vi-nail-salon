"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AppointmentCard } from "@/components/domain/appointment-card";
import { useToast } from "@/components/providers/toast-provider";
import { lookupGuestAppointment, cancelGuestAppointment, canModifyStatuses } from "@/features/guest-booking/lookup";
import { useApi } from "@/hooks/use-api";
import { ApiError } from "@/lib/api-client";

function CancelContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const phone = searchParams.get("phone") ?? "";
  const { showToast } = useToast();

  const {
    data: appointment,
    isLoading: isLoadingAppointment,
    error: appointmentError,
  } = useApi(() => lookupGuestAppointment(code, phone), [code, phone], { enabled: Boolean(code && phone) });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (isLoadingAppointment) {
    return (
      <Container className="max-w-2xl py-10 sm:py-14">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-40 w-full rounded-lg" />
      </Container>
    );
  }

  if (!appointment || appointmentError || !canModifyStatuses.includes(appointment.status)) {
    return (
      <Container className="max-w-lg py-14">
        <ErrorState title="Không thể hủy lịch" description="Lịch hẹn không tồn tại hoặc không còn ở trạng thái cho phép hủy." />
        <div className="mt-6 text-center">
          <Button asChild variant="secondary">
            <Link href="/guest-booking">Quay lại tra cứu</Link>
          </Button>
        </div>
      </Container>
    );
  }

  if (done) {
    return (
      <Container className="flex max-w-lg flex-col items-center py-14 text-center">
        <CheckCircle2 className="size-14 text-success" aria-hidden="true" />
        <h1 className="mt-4 text-h2 font-serif font-semibold text-text">Đã hủy lịch hẹn</h1>
        <p className="mt-2 text-body-sm text-text-muted">Lịch hẹn {appointment.code} đã được hủy thành công.</p>
        <Button asChild className="mt-6">
          <Link href="/booking">Đặt lịch mới</Link>
        </Button>
      </Container>
    );
  }

  async function handleConfirmCancel() {
    setIsSubmitting(true);
    try {
      await cancelGuestAppointment(code, phone);
      setDialogOpen(false);
      setDone(true);
    } catch (err) {
      showToast({
        variant: "error",
        title: "Hủy lịch thất bại",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container className="max-w-2xl py-10 sm:py-14">
      <PageHeader title="Hủy lịch hẹn" description={`Xác nhận hủy lịch hẹn ${appointment.code}.`} />

      <div className="mt-8">
        <AppointmentCard
          appointment={appointment}
          href={`/guest-booking?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`}
        />
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-lg bg-warning-bg p-4 text-body-sm text-warning">
        <AlertTriangle className="mt-0.5 size-4.5 shrink-0" aria-hidden="true" />
        Hủy lịch trong vòng 2 giờ trước giờ hẹn có thể ảnh hưởng đến việc đặt lịch của bạn trong tương lai.
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" asChild>
          <Link href={`/guest-booking?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`}>Quay lại</Link>
        </Button>
        <Button variant="destructive" onClick={() => setDialogOpen(true)}>
          Hủy lịch hẹn
        </Button>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Xác nhận hủy lịch hẹn"
        description="Bạn sẽ không thể hoàn tác thao tác này. Vui lòng xác nhận nếu chắc chắn muốn hủy."
        confirmLabel="Xác nhận hủy"
        destructive
        isLoading={isSubmitting}
      />
    </Container>
  );
}

export default function CancelPage() {
  return (
    <Suspense>
      <CancelContent />
    </Suspense>
  );
}
