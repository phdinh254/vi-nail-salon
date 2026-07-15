import type { TimeSlot } from "@/components/ui/time-slot-picker";

const DAY_START_HOUR = 9;
const DAY_END_HOUR = 20;

function hashDateKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % 97;
  }
  return hash;
}

/**
 * Sinh khung giờ xác định (deterministic) theo ngày + nhân viên để trình bày
 * giao diện. Khi có backend, thay bằng truy vấn lịch trống thật.
 */
export function generateTimeSlots(date: Date, staffId: string | null): TimeSlot[] {
  const isSunday = date.getDay() === 0;
  const key = `${date.toDateString()}-${staffId ?? "ANY"}`;
  const seed = hashDateKey(key);

  if (isSunday && seed % 5 === 0) return [];

  const slots: TimeSlot[] = [];
  for (let hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour += 1) {
    for (const minute of [0, 30]) {
      const slotIndex = (hour - DAY_START_HOUR) * 2 + (minute === 30 ? 1 : 0);
      const unavailable = (seed + slotIndex) % 4 === 0;
      slots.push({
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        available: !unavailable,
      });
    }
  }
  return slots;
}
