"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

const weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const monthLabels = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function DatePicker({
  value,
  onChange,
  minDate = startOfDay(new Date()),
  maxDate,
}: {
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  const [viewDate, setViewDate] = useState(() => value ?? new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1));
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Tháng trước"
          onClick={() => changeMonth(-1)}
          className="rounded-md p-1.5 text-text-muted hover:bg-bg-subtle"
        >
          <ChevronLeft className="size-4.5" aria-hidden="true" />
        </button>
        <p className="text-body font-semibold text-text">
          {monthLabels[month]} {year}
        </p>
        <button
          type="button"
          aria-label="Tháng sau"
          onClick={() => changeMonth(1)}
          className="rounded-md p-1.5 text-text-muted hover:bg-bg-subtle"
        >
          <ChevronRight className="size-4.5" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdayLabels.map((label) => (
          <span key={label} className="text-caption font-medium text-text-muted">
            {label}
          </span>
        ))}
        {cells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} />;
          const disabled = date < minDate || (maxDate ? date > maxDate : false);
          const selected = value ? isSameDay(date, value) : false;
          const today = isSameDay(date, new Date());
          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              aria-current={today ? "date" : undefined}
              aria-pressed={selected}
              onClick={() => onChange(date)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md text-body-sm transition-colors duration-fast disabled:cursor-not-allowed disabled:text-border",
                selected && "bg-primary font-semibold text-primary-foreground",
                !selected && !disabled && "text-text hover:bg-bg-subtle",
                today && !selected && "font-semibold text-primary",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
