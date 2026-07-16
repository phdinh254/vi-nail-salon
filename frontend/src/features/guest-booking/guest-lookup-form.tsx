"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { lookupGuestAppointment } from "@/features/guest-booking/lookup";

export function GuestLookupForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const appointment = await lookupGuestAppointment(code, phone);
      setNotFound(false);
      router.push(`/guest-booking?code=${encodeURIComponent(appointment.code)}&phone=${encodeURIComponent(phone.trim())}`);
    } catch {
      setNotFound(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-soft-sm">
      <Field id="lookup-code" label="Mã lịch hẹn" required>
        <Input id="lookup-code" value={code} placeholder="VN-1002" onChange={(e) => setCode(e.target.value)} />
      </Field>
      <Field id="lookup-phone" label="Số điện thoại đã đặt lịch" required>
        <PhoneInput id="lookup-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Button type="submit" isLoading={isSubmitting}>
        <Search className="size-4" aria-hidden="true" />
        Tra cứu lịch hẹn
      </Button>
      {notFound ? (
        <ErrorState
          title="Không tìm thấy lịch hẹn"
          description="Vui lòng kiểm tra lại mã lịch hẹn và số điện thoại đã dùng khi đặt lịch."
        />
      ) : null}
    </form>
  );
}
