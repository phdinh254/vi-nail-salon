"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { createPayment } from "@/services/admin.service";
import { updateAppointmentStatus } from "@/services/appointment.service";
import { ApiError } from "@/lib/api-client";
import { PAYMENT_METHODS, paymentMethodLabel, type PaymentMethod } from "@/types/payment";
import type { Appointment } from "@/types/appointment";

export function CompleteAppointmentDialog({
  appointment,
  onClose,
  onCompleted,
}: {
  appointment: Appointment | null;
  onClose: () => void;
  onCompleted: () => void;
}) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointment) {
      setAmount(String(appointment.totalPrice));
      setMethod("CASH");
    }
  }, [appointment]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appointment) return;
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) return;

    setIsSubmitting(true);
    try {
      await createPayment({ appointmentId: appointment.id, amount: parsedAmount, method });
      await updateAppointmentStatus(appointment.id, "COMPLETED");
      showToast({ variant: "success", title: "Đã hoàn thành & ghi nhận thanh toán", description: appointment.code });
      onCompleted();
      onClose();
    } catch (err) {
      showToast({
        variant: "error",
        title: "Không thể ghi nhận thanh toán",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={Boolean(appointment)}
      onClose={onClose}
      title="Hoàn thành & ghi nhận thanh toán"
      description={appointment ? `${appointment.code} · ${appointment.customerName}` : undefined}
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <Field id="cp-amount" label="Số tiền" required>
          <Input
            id="cp-amount"
            type="number"
            min={0}
            step={1000}
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <Field id="cp-method" label="Phương thức thanh toán" required>
          <Select id="cp-method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {paymentMethodLabel[m]}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" className="w-fit" isLoading={isSubmitting}>
          Xác nhận hoàn thành
        </Button>
      </form>
    </Dialog>
  );
}
