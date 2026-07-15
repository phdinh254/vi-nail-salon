"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { AppointmentCard } from "@/components/domain/appointment-card";
import type { Appointment } from "@/types/appointment";

const upcomingStatuses = ["PENDING_CONFIRMATION", "CONFIRMED", "CHECKED_IN", "IN_SERVICE"];

export function CustomerAppointmentsList({ appointments }: { appointments: Appointment[] }) {
  const [tab, setTab] = useState("upcoming");

  const upcoming = appointments.filter((a) => upcomingStatuses.includes(a.status));
  const completed = appointments.filter((a) => a.status === "COMPLETED");
  const cancelled = appointments.filter((a) => a.status === "CANCELLED" || a.status === "NO_SHOW");

  const groups: Record<string, Appointment[]> = { upcoming, completed, cancelled };
  const current = groups[tab] ?? [];

  return (
    <div>
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "upcoming", label: "Sắp tới", count: upcoming.length },
          { value: "completed", label: "Đã hoàn thành", count: completed.length },
          { value: "cancelled", label: "Đã hủy", count: cancelled.length },
        ]}
      />
      {current.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={tab === "upcoming" ? "Chưa có lịch hẹn sắp tới" : "Không có lịch hẹn nào"}
            actionLabel={tab === "upcoming" ? "Đặt lịch ngay" : undefined}
            actionHref={tab === "upcoming" ? "/booking" : undefined}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {current.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} href={`/customer/appointments/${appointment.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
