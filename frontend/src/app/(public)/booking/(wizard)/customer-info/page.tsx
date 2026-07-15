"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, fieldDescribedBy } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { BookingStepLayout } from "@/features/booking/booking-step-layout";
import { useBooking } from "@/features/booking/booking-context";
import { isValidVietnamesePhone } from "@/utils/format";
import { getNailDesignById } from "@/fixtures/nail-designs";

export default function CustomerInfoStepPage() {
  const router = useRouter();
  const { state, update, selectedServices } = useBooking();
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    if (selectedServices.length === 0) router.replace("/booking/services");
    else if (!state.date || !state.time) router.replace("/booking/schedule");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (selectedServices.length === 0 || !state.date || !state.time) return null;

  const nailDesign = state.nailDesignId ? getNailDesignById(state.nailDesignId) : null;

  function handleContinue() {
    const nextErrors: { name?: string; phone?: string } = {};
    if (!state.customerName.trim()) nextErrors.name = "Vui lòng nhập họ tên.";
    if (!isValidVietnamesePhone(state.customerPhone)) nextErrors.phone = "Số điện thoại không hợp lệ.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) router.push("/booking/verify-otp");
  }

  return (
    <BookingStepLayout
      title="Thông tin của bạn"
      description="Tiệm sẽ dùng số điện thoại này để xác nhận và liên hệ khi cần."
      onBack={() => router.push("/booking/schedule")}
      onContinue={handleContinue}
    >
      <div className="flex flex-col gap-5">
        {nailDesign ? (
          <div className="rounded-lg border border-accent bg-accent/10 p-4">
            <p className="text-caption text-text-muted">Mẫu nail đã chọn</p>
            <p className="mt-0.5 text-body font-semibold text-text">{nailDesign.name}</p>
          </div>
        ) : null}

        <Field id="customer-name" label="Họ và tên" required error={errors.name}>
          <Input
            id="customer-name"
            autoComplete="name"
            value={state.customerName}
            invalid={Boolean(errors.name)}
            aria-describedby={fieldDescribedBy("customer-name", errors.name)}
            onChange={(e) => update("customerName", e.target.value)}
          />
        </Field>

        <Field id="customer-phone" label="Số điện thoại" required error={errors.phone} hint="Dùng để xác minh bằng mã OTP ở bước tiếp theo.">
          <PhoneInput
            id="customer-phone"
            value={state.customerPhone}
            invalid={Boolean(errors.phone)}
            aria-describedby={fieldDescribedBy("customer-phone", errors.phone, "Dùng để xác minh bằng mã OTP ở bước tiếp theo.")}
            onChange={(e) => update("customerPhone", e.target.value)}
          />
        </Field>

        <Field id="allergy-note" label="Dị ứng (nếu có)" hint="Ví dụ: dị ứng tinh dầu, hoá chất sơn gel...">
          <Input
            id="allergy-note"
            value={state.allergyNote}
            onChange={(e) => update("allergyNote", e.target.value)}
          />
        </Field>

        <Field id="request-note" label="Ghi chú thêm">
          <Textarea
            id="request-note"
            value={state.requestNote}
            placeholder="Yêu cầu riêng bạn muốn tiệm lưu ý..."
            onChange={(e) => update("requestNote", e.target.value)}
          />
        </Field>
      </div>
    </BookingStepLayout>
  );
}
