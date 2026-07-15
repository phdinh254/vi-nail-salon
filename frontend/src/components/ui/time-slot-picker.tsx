import { cn } from "@/utils/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarX2 } from "lucide-react";

export type TimeSlot = { time: string; available: boolean };

export function TimeSlotPicker({
  slots,
  value,
  onChange,
  isLoading,
}: {
  slots: TimeSlot[];
  value: string | null;
  onChange: (time: string) => void;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-11" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Không còn khung giờ trống"
        description="Vui lòng chọn ngày khác hoặc liên hệ tiệm để được hỗ trợ sắp xếp."
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4" role="radiogroup" aria-label="Khung giờ">
      {slots.map((slot) => {
        const selected = value === slot.time;
        return (
          <button
            key={slot.time}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={!slot.available}
            onClick={() => onChange(slot.time)}
            className={cn(
              "h-11 rounded-md border text-body-sm font-medium transition-colors duration-fast",
              !slot.available && "cursor-not-allowed border-border bg-bg-subtle text-text-muted line-through",
              slot.available && !selected && "border-border bg-surface text-text hover:border-primary",
              selected && "border-primary bg-primary text-primary-foreground",
            )}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}
