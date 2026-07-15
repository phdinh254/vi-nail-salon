"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/providers/toast-provider";
import { demoCustomerSession } from "@/fixtures/session";

export default function CustomerProfilePage() {
  const { showToast } = useToast();
  const [name, setName] = useState(demoCustomerSession.name);
  const [email, setEmail] = useState(demoCustomerSession.email ?? "");
  const [isSaving, setIsSaving] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast({ variant: "success", title: "Đã lưu thông tin hồ sơ" });
    }, 700);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Hồ sơ của tôi" description="Cập nhật thông tin liên hệ để tiệm dễ dàng hỗ trợ bạn." />

      <div className="flex items-center gap-4">
        <Avatar initials={demoCustomerSession.initials} size="lg" />
        <div>
          <p className="text-body font-semibold text-text">{demoCustomerSession.name}</p>
          <p className="text-body-sm text-text-muted">{demoCustomerSession.phone}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex max-w-md flex-col gap-5">
        <Field id="profile-name" label="Họ và tên" required>
          <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field id="profile-phone" label="Số điện thoại" required hint="Liên hệ tiệm nếu cần đổi số điện thoại đăng ký.">
          <PhoneInput id="profile-phone" value={demoCustomerSession.phone} disabled />
        </Field>
        <Field id="profile-email" label="Email">
          <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Button type="submit" isLoading={isSaving} className="w-fit">
          Lưu thay đổi
        </Button>
      </form>
    </div>
  );
}
