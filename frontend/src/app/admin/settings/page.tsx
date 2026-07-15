"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { siteConfig } from "@/config/site";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState<{ brandName: string; phone: string; address: string }>({
    brandName: siteConfig.brandName,
    phone: siteConfig.phone,
    address: siteConfig.address,
  });
  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast({ variant: "success", title: "Đã lưu cài đặt tiệm" });
    }, 700);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Cài đặt" description="Thông tin thương hiệu và liên hệ hiển thị công khai." />

      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
        <Field id="settings-name" label="Tên tiệm" required>
          <Input id="settings-name" value={form.brandName} onChange={(e) => setForm((f) => ({ ...f, brandName: e.target.value }))} />
        </Field>
        <Field id="settings-phone" label="Số điện thoại" required>
          <PhoneInput id="settings-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </Field>
        <Field id="settings-address" label="Địa chỉ" required>
          <Textarea id="settings-address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </Field>
        <Button type="submit" isLoading={isSaving} className="w-fit">
          Lưu cài đặt
        </Button>
      </form>

      <p className="text-caption text-text-muted">
        Cài đặt phân quyền chi tiết, thanh toán và tích hợp sẽ được bổ sung khi kết nối backend.
      </p>
    </div>
  );
}
