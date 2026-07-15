"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, fieldDescribedBy } from "@/components/ui/field";
import { PhoneInput } from "@/components/ui/phone-input";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { isValidVietnamesePhone } from "@/utils/format";

type Errors = Partial<Record<"name" | "phone" | "password" | "confirmPassword" | "terms", string>>;

export default function RegisterPage() {
  const { showToast } = useToast();
  const [values, setValues] = useState({ name: "", phone: "", password: "", confirmPassword: "" });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Errors = {};
    if (!values.name.trim()) nextErrors.name = "Vui lòng nhập họ tên.";
    if (!isValidVietnamesePhone(values.phone)) nextErrors.phone = "Số điện thoại không hợp lệ.";
    if (values.password.length < 6) nextErrors.password = "Mật khẩu cần tối thiểu 6 ký tự.";
    if (values.confirmPassword !== values.password) nextErrors.confirmPassword = "Mật khẩu nhập lại không khớp.";
    if (!agreed) nextErrors.terms = "Vui lòng đồng ý điều khoản để tiếp tục.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast({
        variant: "info",
        title: "Giao diện xem trước",
        description: "Tạo tài khoản sẽ hoạt động khi kết nối hệ thống xác thực thật.",
      });
    }, 800);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo tài khoản</CardTitle>
        <CardDescription>Quản lý lịch sử, lưu mẫu nail yêu thích và đặt lịch nhanh hơn.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Field id="register-name" label="Họ và tên" required error={errors.name}>
            <Input
              id="register-name"
              autoComplete="name"
              value={values.name}
              invalid={Boolean(errors.name)}
              aria-describedby={fieldDescribedBy("register-name", errors.name)}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
          </Field>
          <Field id="register-phone" label="Số điện thoại" required error={errors.phone}>
            <PhoneInput
              id="register-phone"
              value={values.phone}
              invalid={Boolean(errors.phone)}
              aria-describedby={fieldDescribedBy("register-phone", errors.phone)}
              onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            />
          </Field>
          <Field id="register-password" label="Mật khẩu" required error={errors.password}>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              invalid={Boolean(errors.password)}
              aria-describedby={fieldDescribedBy("register-password", errors.password)}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            />
          </Field>
          <Field id="register-confirm-password" label="Nhập lại mật khẩu" required error={errors.confirmPassword}>
            <Input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              invalid={Boolean(errors.confirmPassword)}
              aria-describedby={fieldDescribedBy("register-confirm-password", errors.confirmPassword)}
              onChange={(e) => setValues((v) => ({ ...v, confirmPassword: e.target.value }))}
            />
          </Field>

          <div>
            <Checkbox
              id="register-terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              label="Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật."
            />
            {errors.terms ? <p className="mt-1.5 text-caption text-error">{errors.terms}</p> : null}
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Tạo tài khoản
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-text-muted">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
