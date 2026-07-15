"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, fieldDescribedBy } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { isValidVietnamesePhone } from "@/utils/format";

type FormState = { name: string; phone: string; message: string };

export function ContactForm() {
  const [values, setValues] = useState<FormState>({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!values.name.trim()) nextErrors.name = "Vui lòng nhập họ tên.";
    if (!isValidVietnamesePhone(values.phone)) nextErrors.phone = "Số điện thoại không hợp lệ.";
    if (!values.message.trim()) nextErrors.message = "Vui lòng nhập nội dung cần liên hệ.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    // Trình bày giao diện — chưa nối API gửi liên hệ thật.
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success-bg p-8 text-center">
        <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
        <p className="text-body font-semibold text-text">Đã gửi yêu cầu liên hệ</p>
        <p className="max-w-sm text-body-sm text-text-muted">
          Cảm ơn bạn đã liên hệ. Đội ngũ Lys Nail Studio sẽ phản hồi trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field id="contact-name" label="Họ và tên" required error={errors.name}>
        <Input
          id="contact-name"
          value={values.name}
          invalid={Boolean(errors.name)}
          aria-describedby={fieldDescribedBy("contact-name", errors.name)}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </Field>
      <Field id="contact-phone" label="Số điện thoại" required error={errors.phone}>
        <PhoneInput
          id="contact-phone"
          value={values.phone}
          invalid={Boolean(errors.phone)}
          aria-describedby={fieldDescribedBy("contact-phone", errors.phone)}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
        />
      </Field>
      <Field id="contact-message" label="Nội dung" required error={errors.message}>
        <Textarea
          id="contact-message"
          value={values.message}
          invalid={Boolean(errors.message)}
          aria-describedby={fieldDescribedBy("contact-message", errors.message)}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
        />
      </Field>
      <Button type="submit" isLoading={status === "submitting"} className="w-fit">
        Gửi liên hệ
      </Button>
    </form>
  );
}
