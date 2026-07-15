"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import type { Appointment } from "@/types/appointment";
import { formatCurrencyVND } from "@/utils/format";

const weekdayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function RevenueTrendChart({ completedAppointments, anchorDate }: { completedAppointments: Appointment[]; anchorDate: Date }) {
  const [rangeDays, setRangeDays] = useState("7");

  const days = useMemo(() => {
    const count = Number(rangeDays);
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(anchorDate);
      d.setDate(d.getDate() - (count - 1 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }, [rangeDays, anchorDate]);

  const revenueByDay = days.map((day) => {
    const revenue = completedAppointments
      .filter((a) => new Date(a.startAt).toDateString() === day.toDateString())
      .reduce((sum, a) => sum + a.totalPrice, 0);
    return { day, revenue };
  });

  const maxRevenue = Math.max(1, ...revenueByDay.map((d) => d.revenue));
  const total = revenueByDay.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-label text-text">Doanh thu theo ngày</p>
          <p className="text-caption text-text-muted">Tổng {rangeDays} ngày gần nhất: {formatCurrencyVND(total)}</p>
        </div>
        <Tabs
          value={rangeDays}
          onChange={setRangeDays}
          items={[
            { value: "7", label: "7 ngày" },
            { value: "14", label: "14 ngày" },
            { value: "30", label: "30 ngày" },
          ]}
        />
      </div>

      <div className="mt-6 flex items-end gap-2 overflow-x-auto pb-2">
        {revenueByDay.map(({ day, revenue }) => (
          <div key={day.toISOString()} className="flex min-w-10 flex-1 flex-col items-center gap-2">
            <span className="text-caption text-text-muted">{revenue > 0 ? formatCurrencyVND(revenue) : ""}</span>
            <div className="flex h-32 w-full items-end rounded-md bg-bg-subtle">
              <div
                className="w-full rounded-md bg-primary transition-[height] duration-base"
                style={{ height: `${(revenue / maxRevenue) * 100}%` }}
              />
            </div>
            <span className="text-caption text-text-muted">
              {weekdayLabels[day.getDay()]} {day.getDate()}/{day.getMonth() + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
