"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { TimeSlotPicker, type TimeSlot } from "@/components/ui/time-slot-picker";
import { ErrorState } from "@/components/ui/error-state";
import { useToast } from "@/components/providers/toast-provider";
import { useApi } from "@/hooks/use-api";
import { useAvailability } from "@/hooks/use-availability";
import { listServices, listStaff } from "@/services/catalog.service";
import { listAdminCustomers } from "@/services/admin.service";
import { createStaffAppointment } from "@/services/appointment.service";
import { ApiError } from "@/lib/api-client";
import { formatCurrencyVND, formatDurationMinutes, formatDateVN, formatTimeVN, isValidVietnamesePhone } from "@/utils/format";

const appointmentSchema = z.object({
  customerPhone: z.string().refine(isValidVietnamesePhone, "Số điện thoại không hợp lệ."),
  customerName: z.string().trim().min(1, "Vui lòng nhập tên khách hàng."),
  serviceIds: z.array(z.string()).min(1, "Chọn ít nhất một dịch vụ."),
  staffId: z.string(),
  allergyNote: z.string(),
  requestNote: z.string(),
});

type AppointmentFormInput = z.infer<typeof appointmentSchema>;

const emptyValues: AppointmentFormInput = {
  customerPhone: "",
  customerName: "",
  serviceIds: [],
  staffId: "ANY",
  allergyNote: "",
  requestNote: "",
};

function buildStartAt(date: Date, time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

export function CreateAppointmentDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { showToast } = useToast();
  const servicesState = useApi(listServices, []);
  const staffState = useApi(listStaff, []);
  const customersState = useApi(listAdminCustomers, [], { enabled: open });
  const services = useMemo(() => servicesState.data ?? [], [servicesState.data]);
  const staffMembers = useMemo(() => staffState.data ?? [], [staffState.data]);
  const customers = customersState.data ?? [];

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [dateTimeError, setDateTimeError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: emptyValues,
  });

  const selectedServiceIds = watch("serviceIds");
  const staffId = watch("staffId");

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds],
  );
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.priceFrom, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const eligibleStaff = useMemo(
    () => staffMembers.filter((m) => selectedServiceIds.every((id) => m.serviceIds.includes(id))),
    [staffMembers, selectedServiceIds],
  );

  const { slots: availabilitySlots, isLoading: slotsLoading, error: availabilityError } = useAvailability({
    date,
    serviceIds: selectedServiceIds,
    staffId,
  });
  const slots: TimeSlot[] = availabilitySlots.map((s) => ({
    time: formatTimeVN(new Date(s.startAt)),
    available: true,
  }));

  // Reset the picked time whenever the underlying availability changes — never let a stale
  // selection from a previous fetch slip through to submit.
  useEffect(() => {
    setTime(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, staffId, selectedServiceIds.join(",")]);

  function handlePhoneBlur() {
    const phone = getValues("customerPhone");
    const match = customers.find((c) => c.phone === phone);
    if (match && !getValues("customerName")) {
      setValue("customerName", match.name);
    }
  }

  function handleClose() {
    reset(emptyValues);
    setDate(null);
    setTime(null);
    setDateTimeError(null);
    onClose();
  }

  async function onSubmit(values: AppointmentFormInput) {
    if (!date || !time) {
      setDateTimeError("Vui lòng chọn ngày và giờ hẹn.");
      return;
    }
    setDateTimeError(null);
    setIsSubmitting(true);
    try {
      await createStaffAppointment({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        serviceIds: values.serviceIds,
        staffId: values.staffId === "ANY" ? undefined : values.staffId,
        startAt: buildStartAt(date, time),
        allergyNote: values.allergyNote || undefined,
        requestNote: values.requestNote || undefined,
      });
      showToast({ variant: "success", title: "Đã tạo lịch hẹn", description: values.customerName });
      onCreated();
      handleClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setTime(null);
        showToast({
          variant: "error",
          title: "Khung giờ vừa được đặt bởi lịch hẹn khác",
          description: "Vui lòng chọn lại khung giờ khác.",
        });
        return;
      }
      showToast({
        variant: "error",
        title: "Không thể tạo lịch hẹn",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Tạo lịch hộ khách"
      description="Dùng khi khách gọi điện hoặc đến trực tiếp đặt lịch."
      className="max-w-2xl"
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="ca-phone" label="Số điện thoại khách" required error={errors.customerPhone?.message}>
            <Controller
              control={control}
              name="customerPhone"
              render={({ field }) => (
                <PhoneInput
                  id="ca-phone"
                  invalid={Boolean(errors.customerPhone)}
                  {...field}
                  onBlur={() => {
                    field.onBlur();
                    handlePhoneBlur();
                  }}
                />
              )}
            />
          </Field>
          <Field id="ca-name" label="Tên khách hàng" required error={errors.customerName?.message}>
            <Input id="ca-name" invalid={Boolean(errors.customerName)} {...register("customerName")} />
          </Field>
        </div>

        <Field id="ca-services" label="Dịch vụ" required error={errors.serviceIds?.message}>
          <Controller
            control={control}
            name="serviceIds"
            render={({ field }) => (
              <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-md border border-border p-3">
                {services.map((s) => (
                  <Checkbox
                    key={s.id}
                    id={`ca-service-${s.id}`}
                    label={`${s.name} · ${formatCurrencyVND(s.priceFrom)} · ${formatDurationMinutes(s.durationMinutes)}`}
                    checked={field.value.includes(s.id)}
                    onChange={(e) => {
                      field.onChange(
                        e.target.checked ? [...field.value, s.id] : field.value.filter((id) => id !== s.id),
                      );
                    }}
                  />
                ))}
              </div>
            )}
          />
          {selectedServices.length > 0 ? (
            <p className="text-caption text-text-muted">
              Tổng dự kiến: {formatCurrencyVND(totalPrice)} · {formatDurationMinutes(totalDuration)} (giá cuối do hệ thống tính khi tạo lịch)
            </p>
          ) : null}
        </Field>

        <Field id="ca-staff" label="Nhân viên">
          <select
            id="ca-staff"
            className="h-11 w-full rounded-md border border-border bg-surface px-4 text-body text-text"
            {...register("staffId")}
          >
            <option value="ANY">Bất kỳ nhân viên nào</option>
            {eligibleStaff.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>

        <div>
          <p className="text-label text-text">
            Ngày và giờ hẹn <span className="text-error">*</span>
          </p>
          <div className="mt-2 grid gap-4 sm:grid-cols-[auto_1fr]">
            <DatePicker value={date} onChange={(d) => { setDate(d); setTime(null); }} />
            <div>
              {!date ? (
                <p className="text-body-sm text-text-muted">Chọn ngày để xem khung giờ.</p>
              ) : availabilityError ? (
                <ErrorState description={availabilityError} />
              ) : (
                <TimeSlotPicker slots={slots} value={time} onChange={setTime} isLoading={slotsLoading} />
              )}
            </div>
          </div>
          {dateTimeError ? <p className="mt-2 text-caption text-error">{dateTimeError}</p> : null}
          {date && time ? (
            <p className="mt-2 text-caption text-text-muted">Đã chọn: {formatDateVN(date)} · {time}</p>
          ) : null}
        </div>

        <Field id="ca-allergy" label="Ghi chú dị ứng" hint="Không bắt buộc">
          <Textarea id="ca-allergy" rows={2} {...register("allergyNote")} />
        </Field>
        <Field id="ca-request" label="Yêu cầu đặc biệt" hint="Không bắt buộc">
          <Textarea id="ca-request" rows={2} {...register("requestNote")} />
        </Field>

        <Button type="submit" className="w-fit" isLoading={isSubmitting}>
          Tạo lịch hẹn
        </Button>
      </form>
    </Dialog>
  );
}
