"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Clock, User, Phone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingStepLayout } from "@/features/booking/booking-step-layout";
import { useBooking } from "@/features/booking/booking-context";
import { useAuth } from "@/stores/auth-store";
import { useToast } from "@/components/providers/toast-provider";
import { useApi } from "@/hooks/use-api";
import { getStaffMember, getNailDesign } from "@/services/catalog.service";
import { createGuestAppointment } from "@/services/appointment.service";
import { ApiError } from "@/lib/api-client";
import { formatCurrencyVND, formatDateVN, formatDurationMinutes } from "@/utils/format";

function buildStartAt(date: Date, time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

export default function ReviewStepPage() {
  const router = useRouter();
  const { state, update, selectedServices, totalPrice, totalDurationMinutes, setCreatedAppointment } = useBooking();
  const { bookingToken } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedServices.length === 0) router.replace("/booking/services");
    else if (!state.otpVerified) router.replace("/booking/customer-info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasStaffId = Boolean(state.staffId && state.staffId !== "ANY");
  const { data: staff } = useApi(
    () => getStaffMember(state.staffId as string),
    [state.staffId],
    { enabled: hasStaffId },
  );
  const hasNailDesign = Boolean(state.nailDesignId);
  const { data: nailDesign } = useApi(
    () => getNailDesign(state.nailDesignId as string),
    [state.nailDesignId],
    { enabled: hasNailDesign },
  );

  if (selectedServices.length === 0 || !state.otpVerified || !state.date) return null;

  async function handleConfirm() {
    if (!state.date || !state.time) return;
    if (!bookingToken) {
      showToast({
        variant: "error",
        title: "Phiên xác minh đã hết hạn",
        description: "Vui lòng xác minh lại số điện thoại để tiếp tục.",
      });
      router.push("/booking/verify-otp");
      return;
    }

    setIsSubmitting(true);
    try {
      const appointment = await createGuestAppointment(
        {
          customerName: state.customerName,
          serviceIds: state.serviceIds,
          staffId: hasStaffId ? (state.staffId as string) : undefined,
          startAt: buildStartAt(state.date, state.time),
          nailDesignId: state.nailDesignId ?? undefined,
          allergyNote: state.allergyNote || undefined,
          requestNote: state.requestNote || undefined,
        },
        bookingToken,
      );
      setCreatedAppointment(appointment);
      router.push("/booking/success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Someone else booked this slot between when it was fetched and now — the picked
        // time is no longer valid. Clear it and send the guest back to re-fetch real
        // availability rather than letting them retry the same stale slot.
        update("time", null);
        showToast({
          variant: "error",
          title: "Khung giờ vừa được đặt bởi người khác",
          description: "Vui lòng chọn lại khung giờ khác.",
        });
        router.push("/booking/schedule");
        return;
      }
      showToast({
        variant: "error",
        title: "Đặt lịch thất bại",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <BookingStepLayout
      title="Kiểm tra lại thông tin"
      description="Vui lòng kiểm tra kỹ trước khi xác nhận đặt lịch."
      onBack={() => router.push("/booking/verify-otp")}
      hideSummary
    >
      <div className="flex flex-col gap-5">
        <section className="rounded-lg border border-border bg-surface p-5">
          <p className="text-label text-text">Dịch vụ đã chọn</p>
          <ul className="mt-3 flex flex-col gap-2">
            {selectedServices.map((service) => (
              <li key={service.id} className="flex items-center justify-between text-body-sm">
                <span className="text-text">{service.name}</span>
                <span className="text-text-muted">{formatCurrencyVND(service.priceFrom)}</span>
              </li>
            ))}
          </ul>
          {nailDesign ? (
            <p className="mt-3 text-body-sm text-text-muted">
              Mẫu nail: <span className="text-text">{nailDesign.name}</span>
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-body-sm text-text-muted">
              <Clock className="mr-1.5 inline size-4" aria-hidden="true" />
              {formatDurationMinutes(totalDurationMinutes)}
            </span>
            <span className="text-body font-semibold text-primary">{formatCurrencyVND(totalPrice)}</span>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <p className="text-label text-text">Thời gian &amp; nhân viên</p>
          <ul className="mt-3 flex flex-col gap-2 text-body-sm text-text">
            <li className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" aria-hidden="true" />
              {formatDateVN(state.date)} · {state.time}
            </li>
            <li className="flex items-center gap-2">
              <User className="size-4 text-primary" aria-hidden="true" />
              {hasStaffId ? (staff ? staff.name : "...") : "Bất kỳ nhân viên nào — tiệm sẽ sắp xếp"}
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <p className="text-label text-text">Thông tin liên hệ</p>
          <ul className="mt-3 flex flex-col gap-2 text-body-sm text-text">
            <li>{state.customerName}</li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-primary" aria-hidden="true" />
              {state.customerPhone}
            </li>
          </ul>
          {state.allergyNote ? (
            <p className="mt-3 flex items-start gap-2 text-body-sm text-warning">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Dị ứng: {state.allergyNote}
            </p>
          ) : null}
          {state.requestNote ? (
            <p className="mt-2 text-body-sm text-text-muted">Ghi chú: {state.requestNote}</p>
          ) : null}
        </section>

        <section className="rounded-lg bg-bg-subtle p-5 text-body-sm text-text-muted">
          <p className="font-medium text-text">Chính sách đổi và hủy lịch</p>
          <p className="mt-1.5">
            Bạn có thể đổi hoặc hủy lịch miễn phí trước giờ hẹn tối thiểu 2 giờ. Xem chi tiết tại{" "}
            <Link href="/policies" className="font-medium text-primary hover:underline">
              trang chính sách
            </Link>
            .
          </p>
        </section>

        <Button size="lg" onClick={handleConfirm} isLoading={isSubmitting} className="w-full sm:w-fit">
          Xác nhận đặt lịch
        </Button>
      </div>
    </BookingStepLayout>
  );
}
