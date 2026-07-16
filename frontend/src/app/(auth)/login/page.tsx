"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, fieldDescribedBy } from "@/components/ui/field";
import { PhoneInput } from "@/components/ui/phone-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { login } from "@/services/auth.service";
import { useAuth } from "@/stores/auth-store";
import { ApiError } from "@/lib/api-client";
import { isValidVietnamesePhone } from "@/utils/format";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  STAFF: "/staff/dashboard",
  CUSTOMER: "/customer/dashboard",
};

export default function LoginPage() {
  const { showToast } = useToast();
  const { setSession } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!isValidVietnamesePhone(phone)) nextErrors.phone = "Số điện thoại không hợp lệ.";
    if (password.length < 6) nextErrors.password = "Mật khẩu cần tối thiểu 6 ký tự.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = await login({ phone, password });
      setSession(result.accessToken, result.user);
      router.push(ROLE_HOME[result.user.role] ?? "/");
    } catch (err) {
      showToast({
        variant: "error",
        title: "Đăng nhập thất bại",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>Đăng nhập để quản lý lịch hẹn và mẫu nail yêu thích.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Field id="login-phone" label="Số điện thoại" required error={errors.phone}>
            <PhoneInput
              id="login-phone"
              value={phone}
              invalid={Boolean(errors.phone)}
              aria-describedby={fieldDescribedBy("login-phone", errors.phone)}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field id="login-password" label="Mật khẩu" required error={errors.password}>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              invalid={Boolean(errors.password)}
              aria-describedby={fieldDescribedBy("login-password", errors.password)}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-body-sm font-medium text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Đăng nhập
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-text-muted">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Tạo tài khoản
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
