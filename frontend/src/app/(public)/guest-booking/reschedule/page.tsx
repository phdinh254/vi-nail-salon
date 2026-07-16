"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { TimeSlotPicker, type TimeSlot } from "@/components/ui/time-slot-picker";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/toast-provider";
import { lookupGuestAppointment, rescheduleGuestAppointment, canModifyStatuses } from "@/features/guest-booking/lookup";
import { useApi } from "@/hooks/use-api";
import { generateTimeSlots } from "@/fixtures/time-slots";
import { formatDateVN } from "@/utils/format";
import { ApiError } from "@/lib/api-client";

function RescheduleContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const phone = searchParams.get("phone") ?? "";
  const { showToast } = useToast();

  const {
    data: appointment,
    isLoading: isLoadingAppointment,
    error: appointmentError,
  } = useApi(() => lookupGuestAppointment(code, phone), [code, phone], { enabled: Boolean(code && phone) });

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!date) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bật skeleton ngay khi ngày thay đổi, trước khi giả lập gọi API
    setIsLoading(true);
    setTime(null);
    const timer = setTimeout(() => {
      setSlots(generateTimeSlots(date, appointment?.staffId ?? null));
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  if (isLoadingAppointment) {
    return (
      <Container className="max-w-2xl py-10 sm:py-14">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-64 w-full rounded-lg" />
      </Container>
    );
  }

  if (!appointment || appointmentError || !canModifyStatuses.includes(appointment.status)) {
    return (
      <Container className="max-w-lg py-14">
        <ErrorState title="Không thể đổi lịch" description="Lịch hẹn không tồn tại hoặc không còn ở trạng thái cho phép đổi lịch." />
        <div className="mt-6 text-center">
          <Button asChild variant="secondary">
            <Link href="/guest-booking">Quay lại tra cứu</Link>
          </Button>
        </div>
      </Container>
    );
  }

  if (done) {
    const query = `code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`;
    return (
      <Container className="flex max-w-lg flex-col items-center py-14 text-center">
        <CheckCircle2 className="size-14 text-success" aria-hidden="true" />
        <h1 className="mt-4 text-h2 font-serif font-semibold text-text">Đổi lịch thành công</h1>
        <p className="mt-2 text-body-sm text-text-muted">
          Lịch hẹn {appointment.code} đã được cập nhật sang {date ? formatDateVN(date) : ""} · {time}.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/guest-booking?${query}`}>Xem lịch hẹn</Link>
        </Button>
      </Container>
    );
  }

  async function handleConfirm() {
    if (!date || !time) return;
    const [hours, minutes] = time.split(":").map(Number);
    const startAt = new Date(date);
    startAt.setHours(hours, minutes, 0, 0);

    setIsSubmitting(true);
    try {
      await rescheduleGuestAppointment(code, phone, startAt.toISOString());
      setDone(true);
    } catch (err) {
      showToast({
        variant: "error",
        title: "Đổi lịch thất bại",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container className="max-w-2xl py-10 sm:py-14">
      <PageHeader title="Đổi lịch hẹn" description={`Chọn ngày giờ mới cho lịch hẹn ${appointment.code}.`} />

      <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr]">
        <DatePicker value={date} onChange={setDate} />
        <div>
          <p className="text-label text-text">Khung giờ trống</p>
          <div className="mt-3">
            {date ? (
              <TimeSlotPicker slots={slots} value={time} onChange={setTime} isLoading={isLoading} />
            ) : (
              <p className="text-body-sm text-text-muted">Vui lòng chọn ngày để xem khung giờ trống.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" asChild>
          <Link href={`/guest-booking?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`}>Hủy thao tác</Link>
        </Button>
        <Button disabled={!date || !time} isLoading={isSubmitting} onClick={handleConfirm}>
          Xác nhận đổi lịch
        </Button>
      </div>
    </Container>
  );
}

export default function ReschedulePage() {
  return (
    <Suspense>
      <RescheduleContent />
    </Suspense>
  );
}
