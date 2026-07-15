"use client";

import { Clock, Wallet } from "lucide-react";
import { useBooking } from "@/features/booking/booking-context";
import { formatCurrencyVND, formatDurationMinutes, formatDateVN } from "@/utils/format";
import { getStaffById } from "@/fixtures/staff";

export function BookingSummary() {
  const { state, selectedServices, totalPrice, totalDurationMinutes } = useBooking();

  if (selectedServices.length === 0) return null;

  const staff = state.staffId && state.staffId !== "ANY" ? getStaffById(state.staffId) : null;

  return (
    <aside className="rounded-lg border border-border bg-bg-subtle p-5">
      <p className="text-label text-text">Tóm tắt lịch hẹn</p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {selectedServices.map((service) => (
          <li key={service.id} className="flex items-center justify-between text-body-sm text-text">
            <span className="truncate pr-2">{service.name}</span>
            <span className="shrink-0 text-text-muted">{formatCurrencyVND(service.priceFrom)}</span>
          </li>
        ))}
      </ul>

      {state.staffId ? (
        <p className="mt-3 text-body-sm text-text-muted">
          Nhân viên: <span className="text-text">{staff ? staff.name : "Bất kỳ nhân viên nào"}</span>
        </p>
      ) : null}
      {state.date && state.time ? (
        <p className="mt-1 text-body-sm text-text-muted">
          Thời gian: <span className="text-text">{formatDateVN(state.date)} · {state.time}</span>
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="inline-flex items-center gap-1.5 text-body-sm text-text-muted">
          <Clock className="size-4" aria-hidden="true" />
          {formatDurationMinutes(totalDurationMinutes)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-body font-semibold text-primary">
          <Wallet className="size-4" aria-hidden="true" />
          {formatCurrencyVND(totalPrice)}
        </span>
      </div>
      <p className="mt-2 text-caption text-text-muted">Giá dự kiến, có thể thay đổi theo thực tế thực hiện.</p>
    </aside>
  );
}
