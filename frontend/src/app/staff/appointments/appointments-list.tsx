"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Appointment } from "@/types/appointment";
import { formatDateVN, formatTimeVN, maskPhoneNumber } from "@/utils/format";

export function StaffAppointmentsList({ appointments }: { appointments: Appointment[] }) {
  const [tab, setTab] = useState("today");

  const todayKey = new Date("2026-07-15").toDateString();
  const today = appointments.filter((a) => new Date(a.startAt).toDateString() === todayKey);
  const upcoming = appointments.filter(
    (a) => new Date(a.startAt) > new Date("2026-07-15") && ["PENDING_CONFIRMATION", "CONFIRMED"].includes(a.status),
  );
  const completed = appointments.filter((a) => a.status === "COMPLETED");
  const cancelled = appointments.filter((a) => a.status === "CANCELLED" || a.status === "NO_SHOW");

  const groups: Record<string, Appointment[]> = { today, upcoming, completed, cancelled };
  const current = groups[tab] ?? [];

  return (
    <div>
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "today", label: "Hôm nay", count: today.length },
          { value: "upcoming", label: "Sắp tới", count: upcoming.length },
          { value: "completed", label: "Đã hoàn thành", count: completed.length },
          { value: "cancelled", label: "Đã hủy", count: cancelled.length },
        ]}
      />
      {current.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Không có lịch hẹn nào" />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2.5">
          {current.map((appointment) => (
            <li key={appointment.id}>
              <Link
                href={`/staff/appointments/${appointment.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface p-4 transition-shadow duration-base hover:shadow-soft-sm"
              >
                <div>
                  <p className="text-body-sm font-semibold text-text">{appointment.customerName}</p>
                  <p className="text-caption text-text-muted">
                    {appointment.services.map((s) => s.serviceName).join(", ")} · {maskPhoneNumber(appointment.customerPhone)}
                  </p>
                  <p className="text-caption text-text-muted">
                    {formatDateVN(new Date(appointment.startAt))} · {formatTimeVN(new Date(appointment.startAt))}
                  </p>
                </div>
                <StatusBadge status={appointment.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
