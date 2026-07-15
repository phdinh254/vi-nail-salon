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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const appointment = lookupGuestAppointment(code, phone);
    if (!appointment) {
      setNotFound(true);
      return;
    }
    setNotFound(false);
    router.push(`/guest-booking?code=${encodeURIComponent(appointment.code)}&phone=${encodeURIComponent(phone.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-soft-sm">
      <Field id="lookup-code" label="Mã lịch hẹn" required>
        <Input id="lookup-code" value={code} placeholder="LN-1002" onChange={(e) => setCode(e.target.value)} />
      </Field>
      <Field id="lookup-phone" label="Số điện thoại đã đặt lịch" required>
        <PhoneInput id="lookup-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Button type="submit">
        <Search className="size-4" aria-hidden="true" />
        Tra cứu lịch hẹn
      </Button>
      <p className="text-caption text-text-muted">
        Dữ liệu minh họa để xem trước giao diện: mã <strong>LN-1002</strong>, số điện thoại{" "}
        <strong>0977445566</strong>.
      </p>
      {notFound ? (
        <ErrorState
          title="Không tìm thấy lịch hẹn"
          description="Vui lòng kiểm tra lại mã lịch hẹn và số điện thoại đã dùng khi đặt lịch."
        />
      ) : null}
    </form>
  );
}
