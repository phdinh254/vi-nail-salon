"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/providers/toast-provider";
import { useAuth } from "@/stores/auth-store";
import { toDemoSession } from "@/utils/session";

export default function CustomerProfilePage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const session = user ? toDemoSession(user) : null;
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Backend hiện chưa có endpoint cập nhật hồ sơ khách hàng (chỉ có /auth/me để đọc
  // thông tin phiên đăng nhập) — vì vậy form này chỉ hiển thị dữ liệu thật, còn thao
  // tác lưu tạm thời không thực hiện được và sẽ báo rõ cho người dùng thay vì giả lập
  // thành công.
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast({
        variant: "warning",
        title: "Chưa hỗ trợ cập nhật hồ sơ",
        description: "Hệ thống chưa có chức năng lưu thay đổi hồ sơ. Vui lòng liên hệ tiệm nếu cần cập nhật thông tin.",
      });
    }, 400);
  }

  if (!session) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Hồ sơ của tôi" description="Cập nhật thông tin liên hệ để tiệm dễ dàng hỗ trợ bạn." />

      <div className="flex items-center gap-4">
        <Avatar initials={session.initials} size="lg" />
        <div>
          <p className="text-body font-semibold text-text">{session.name}</p>
          <p className="text-body-sm text-text-muted">{session.phone}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex max-w-md flex-col gap-5">
        <Field id="profile-name" label="Họ và tên" required>
          <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field id="profile-phone" label="Số điện thoại" required hint="Liên hệ tiệm nếu cần đổi số điện thoại đăng ký.">
          <PhoneInput id="profile-phone" value={session.phone} disabled />
        </Field>
        <Field id="profile-email" label="Email" hint="Hệ thống hiện chưa lưu email cho tài khoản khách hàng.">
          <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Button type="submit" isLoading={isSaving} className="w-fit">
          Lưu thay đổi
        </Button>
      </form>
    </div>
  );
}
