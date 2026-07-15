"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, fieldDescribedBy } from "@/components/ui/field";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/services/auth.service";
import { isValidVietnamesePhone } from "@/utils/format";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidVietnamesePhone(phone)) {
      setError("Số điện thoại không hợp lệ.");
      return;
    }
    setError(undefined);
    setIsSubmitting(true);
    await requestPasswordReset(phone);
    setIsSubmitting(false);
    setSent(true);
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-8 text-center">
          <MailCheck className="size-12 text-success" aria-hidden="true" />
          <p className="text-body font-semibold text-text">Đã gửi hướng dẫn khôi phục</p>
          <p className="text-body-sm text-text-muted">
            Nếu số điện thoại {phone} tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi đến bạn.
          </p>
          <Button asChild variant="secondary" className="mt-3">
            <Link href="/login">Quay lại đăng nhập</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Khôi phục tài khoản</CardTitle>
        <CardDescription>Nhập số điện thoại đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Field id="forgot-phone" label="Số điện thoại" required error={error}>
            <PhoneInput
              id="forgot-phone"
              value={phone}
              invalid={Boolean(error)}
              aria-describedby={fieldDescribedBy("forgot-phone", error)}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Button type="submit" isLoading={isSubmitting}>
            Gửi hướng dẫn khôi phục
          </Button>
        </form>
        <p className="mt-6 text-center text-body-sm text-text-muted">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
