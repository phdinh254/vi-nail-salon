"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/providers/toast-provider";
import { requestTimeOff } from "@/services/time-off.service";
import { ApiError } from "@/lib/api-client";
import { timeOffStatusLabel, type TimeOffRequest } from "@/types/time-off";
import { formatDateShortVN } from "@/utils/format";

const statusTone = { PENDING: "warning", APPROVED: "success", REJECTED: "error" } as const;

export function TimeOffClient({
  requests,
  onRequested,
}: {
  requests: TimeOffRequest[];
  onRequested?: () => void;
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason.trim()) return;
    setIsSubmitting(true);
    try {
      await requestTimeOff(form);
      setForm({ startDate: "", endDate: "", reason: "" });
      showToast({ variant: "success", title: "Đã gửi yêu cầu nghỉ phép", description: "Quản lý sẽ xem xét và phản hồi sớm." });
      onRequested?.();
    } catch (err) {
      showToast({
        variant: "error",
        title: "Gửi yêu cầu thất bại",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <h2 className="text-h3 font-serif font-semibold text-text">Lịch sử yêu cầu</h2>
        {requests.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Chưa có yêu cầu nghỉ phép nào" />
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2.5">
            {requests.map((req) => (
              <li key={req.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body-sm font-medium text-text">
                    {formatDateShortVN(new Date(req.startDate))} - {formatDateShortVN(new Date(req.endDate))}
                  </p>
                  <Badge tone={statusTone[req.status]}>{timeOffStatusLabel[req.status]}</Badge>
                </div>
                <p className="mt-1 text-caption text-text-muted">{req.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-h3 font-serif font-semibold text-text">Gửi yêu cầu mới</h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Field id="off-start" label="Từ ngày" required>
            <Input id="off-start" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
          </Field>
          <Field id="off-end" label="Đến ngày" required>
            <Input id="off-end" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </Field>
          <Field id="off-reason" label="Lý do" required>
            <Textarea id="off-reason" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          </Field>
          <Button type="submit" isLoading={isSubmitting}>
            Gửi yêu cầu
          </Button>
        </form>
      </section>
    </div>
  );
}
