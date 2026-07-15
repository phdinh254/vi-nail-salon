"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import { TimeSlotPicker, type TimeSlot } from "@/components/ui/time-slot-picker";
import { BookingStepLayout } from "@/features/booking/booking-step-layout";
import { useBooking } from "@/features/booking/booking-context";
import { generateTimeSlots } from "@/fixtures/time-slots";

export default function ScheduleStepPage() {
  const router = useRouter();
  const { state, update, selectedServices } = useBooking();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedServices.length === 0) router.replace("/booking/services");
    else if (!state.staffId) router.replace("/booking/staff");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.date) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bật skeleton ngay khi ngày thay đổi, trước khi giả lập gọi API
    setIsLoading(true);
    update("time", null);
    const timer = setTimeout(() => {
      setSlots(generateTimeSlots(state.date as Date, state.staffId === "ANY" ? null : state.staffId));
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.date, state.staffId]);

  if (selectedServices.length === 0 || !state.staffId) return null;

  return (
    <BookingStepLayout
      title="Chọn ngày và giờ"
      description="Khung giờ hiển thị theo thời gian thực tại tiệm."
      onBack={() => router.push("/booking/staff")}
      onContinue={() => router.push("/booking/customer-info")}
      continueDisabled={!state.date || !state.time}
    >
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <DatePicker value={state.date} onChange={(date) => update("date", date)} />
        <div>
          <p className="text-label text-text">Khung giờ trống</p>
          <div className="mt-3">
            {state.date ? (
              <TimeSlotPicker
                slots={slots}
                value={state.time}
                onChange={(time) => update("time", time)}
                isLoading={isLoading}
              />
            ) : (
              <p className="text-body-sm text-text-muted">Vui lòng chọn ngày để xem khung giờ trống.</p>
            )}
          </div>
        </div>
      </div>
    </BookingStepLayout>
  );
}
