import { localWallClockToUtc, localDayOfWeek } from '../common/utils/timezone';

export type WorkingWindow = { startMinute: number; endMinute: number };
export type BusyInterval = { startAt: Date; endAt: Date };

export type StaffAvailabilityInput = {
  staffId: string;
  /** Working windows for the requested local calendar date's day-of-week. Empty = not working
   * that day at all. */
  workingWindows: WorkingWindow[];
  /** Everything that already holds the slot: blocking appointments + approved time off,
   * already narrowed to the requested day and this staff member. */
  busy: BusyInterval[];
};

export type ComputeAvailableSlotsInput = {
  /** Local (Asia/Ho_Chi_Minh) calendar date, "YYYY-MM-DD". */
  dateStr: string;
  durationMinutes: number;
  stepMinutes: number;
  /** Slots starting at or before `now` are excluded. */
  now: Date;
  staff: StaffAvailabilityInput[];
};

export type AvailableSlot = {
  startAt: Date;
  endAt: Date;
  availableStaffIds: string[];
};

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && aEnd.getTime() > bStart.getTime();
}

function isFullyFree(slotStart: Date, slotEnd: Date, busy: BusyInterval[]): boolean {
  return !busy.some((b) => overlaps(slotStart, slotEnd, b.startAt, b.endAt));
}

/**
 * Pure, deterministic slot computation — no DB access, no host/session timezone dependency
 * (local<->UTC conversion goes through the fixed-offset helpers in common/utils/timezone).
 * Given each candidate staff member's working windows and already-busy intervals for one local
 * calendar day, returns the sorted list of slots where the full service duration fits inside at
 * least one staff member's free time, excluding past slots.
 */
export function computeAvailableSlots(input: ComputeAvailableSlotsInput): AvailableSlot[] {
  const { dateStr, durationMinutes, stepMinutes, now, staff } = input;
  // startAt -> Set<staffId>, keyed by the UTC instant so identical local times across staff
  // collapse into one slot entry with a combined availableStaffIds list.
  const byStart = new Map<number, { startAt: Date; endAt: Date; staffIds: Set<string> }>();

  for (const member of staff) {
    for (const window of member.workingWindows) {
      for (
        let slotStartMinute = window.startMinute;
        slotStartMinute + durationMinutes <= window.endMinute;
        slotStartMinute += stepMinutes
      ) {
        const startAt = localWallClockToUtc(dateStr, slotStartMinute);
        if (startAt.getTime() <= now.getTime()) continue;
        const endAt = localWallClockToUtc(dateStr, slotStartMinute + durationMinutes);
        if (!isFullyFree(startAt, endAt, member.busy)) continue;

        const key = startAt.getTime();
        const existing = byStart.get(key);
        if (existing) {
          existing.staffIds.add(member.staffId);
        } else {
          byStart.set(key, { startAt, endAt, staffIds: new Set([member.staffId]) });
        }
      }
    }
  }

  return [...byStart.values()]
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .map((slot) => ({
      startAt: slot.startAt,
      endAt: slot.endAt,
      availableStaffIds: [...slot.staffIds].sort(),
    }));
}

/** Re-exported so callers that already have a local date string can get its day-of-week
 * without importing the timezone module directly. */
export { localDayOfWeek };
