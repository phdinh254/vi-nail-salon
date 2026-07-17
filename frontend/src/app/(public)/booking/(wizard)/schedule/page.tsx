"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import { TimeSlotPicker, type TimeSlot } from "@/components/ui/time-slot-picker";
import { ErrorState } from "@/components/ui/error-state";
import { BookingStepLayout } from "@/features/booking/booking-step-layout";
import { useBooking } from "@/features/booking/booking-context";
import { useAvailability } from "@/hooks/use-availability";
import { formatTimeVN } from "@/utils/format";

export default function ScheduleStepPage() {
  const router = useRouter();
  const { state, update, selectedServices } = useBooking();

  useEffect(() => {
    if (selectedServices.length === 0) router.replace("/booking/services");
    else if (!state.staffId) router.replace("/booking/staff");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { slots: availabilitySlots, isLoading, error } = useAvailability({
    date: state.date,
    serviceIds: state.serviceIds,
    staffId: state.staffId,
  });

  // Reset the picked time whenever the underlying availability changes (new date, staff, or
  // service selection) — never let a stale selection from a previous fetch slip through to
  // submit.
  useEffect(() => {
    update("time", null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.date, state.staffId, state.serviceIds.join(",")]);

  const slots: TimeSlot[] = availabilitySlots.map((s) => ({
    time: formatTimeVN(new Date(s.startAt)),
    available: true,
  }));

  if (selectedServices.length === 0 || !state.staffId) return null;

  return (
    <BookingStepLayout
      title="Chọn ngày và giờ"
      description="Khung giờ hiển thị theo lịch trống thực tế của tiệm."
      onBack={() => router.push("/booking/staff")}
      onContinue={() => router.push("/booking/customer-info")}
      continueDisabled={!state.date || !state.time}
    >
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <DatePicker value={state.date} onChange={(date) => update("date", date)} />
        <div>
          <p className="text-label text-text">Khung giờ trống</p>
          <div className="mt-3">
            {!state.date ? (
              <p className="text-body-sm text-text-muted">Vui lòng chọn ngày để xem khung giờ trống.</p>
            ) : error ? (
              <ErrorState description={error} />
            ) : (
              <TimeSlotPicker
                slots={slots}
                value={state.time}
                onChange={(time) => update("time", time)}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </BookingStepLayout>
  );
}
