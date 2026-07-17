import { computeAvailableSlots } from './availability.domain';
import { localWallClockToUtc } from '../common/utils/timezone';

const DATE = '2026-07-20'; // a Monday, arbitrary future date
const FAR_PAST_NOW = new Date('2020-01-01T00:00:00.000Z');

describe('computeAvailableSlots', () => {
  it('generates stepped slots within a single working window', () => {
    const slots = computeAvailableSlots({
      dateStr: DATE,
      durationMinutes: 30,
      stepMinutes: 30,
      now: FAR_PAST_NOW,
      staff: [
        {
          staffId: 'staff-1',
          workingWindows: [{ startMinute: 9 * 60, endMinute: 10 * 60 }],
          busy: [],
        },
      ],
    });
    // 09:00-10:00 window, 30-minute service, 30-minute step -> 09:00 and 09:30 only (10:00
    // would run past the window's end).
    expect(slots.map((s) => s.startAt.toISOString())).toEqual([
      localWallClockToUtc(DATE, 9 * 60).toISOString(),
      localWallClockToUtc(DATE, 9 * 60 + 30).toISOString(),
    ]);
    expect(slots[0].availableStaffIds).toEqual(['staff-1']);
  });

  it('excludes a slot that overlaps an existing appointment', () => {
    const slots = computeAvailableSlots({
      dateStr: DATE,
      durationMinutes: 30,
      stepMinutes: 30,
      now: FAR_PAST_NOW,
      staff: [
        {
          staffId: 'staff-1',
          workingWindows: [{ startMinute: 9 * 60, endMinute: 11 * 60 }],
          busy: [
            {
              startAt: localWallClockToUtc(DATE, 9 * 60),
              endAt: localWallClockToUtc(DATE, 9 * 60 + 30),
            },
          ],
        },
      ],
    });
    const times = slots.map((s) => s.startAt.toISOString());
    expect(times).not.toContain(localWallClockToUtc(DATE, 9 * 60).toISOString());
    expect(times).toContain(localWallClockToUtc(DATE, 9 * 60 + 30).toISOString());
  });

  it('excludes a slot that overlaps an approved time-off interval', () => {
    const slots = computeAvailableSlots({
      dateStr: DATE,
      durationMinutes: 30,
      stepMinutes: 30,
      now: FAR_PAST_NOW,
      staff: [
        {
          staffId: 'staff-1',
          workingWindows: [{ startMinute: 9 * 60, endMinute: 11 * 60 }],
          busy: [
            // Represents an approved TimeOffRequest covering the whole morning.
            {
              startAt: localWallClockToUtc(DATE, 0),
              endAt: localWallClockToUtc(DATE, 10 * 60),
            },
          ],
        },
      ],
    });
    expect(slots.every((s) => s.startAt.getTime() >= localWallClockToUtc(DATE, 10 * 60).getTime())).toBe(true);
  });

  it('adjacent [start, end) slots do not falsely collide with each other', () => {
    // Two back-to-back busy intervals, [9:00,9:30) and [9:30,10:00) — a free 9:00-9:30 slot for
    // a DIFFERENT reason (none here) would be wrong; but a request for the 9:30 slot itself,
    // right after a 9:00-9:30 busy block, must be considered free.
    const slots = computeAvailableSlots({
      dateStr: DATE,
      durationMinutes: 30,
      stepMinutes: 30,
      now: FAR_PAST_NOW,
      staff: [
        {
          staffId: 'staff-1',
          workingWindows: [{ startMinute: 9 * 60, endMinute: 10 * 60 }],
          busy: [
            { startAt: localWallClockToUtc(DATE, 9 * 60), endAt: localWallClockToUtc(DATE, 9 * 60 + 30) },
          ],
        },
      ],
    });
    expect(slots.map((s) => s.startAt.toISOString())).toEqual([
      localWallClockToUtc(DATE, 9 * 60 + 30).toISOString(),
    ]);
  });

  it('excludes slots at or before "now"', () => {
    const nowAt930 = localWallClockToUtc(DATE, 9 * 60 + 30);
    const slots = computeAvailableSlots({
      dateStr: DATE,
      durationMinutes: 30,
      stepMinutes: 30,
      now: nowAt930,
      staff: [
        {
          staffId: 'staff-1',
          workingWindows: [{ startMinute: 9 * 60, endMinute: 11 * 60 }],
          busy: [],
        },
      ],
    });
    const times = slots.map((s) => s.startAt.toISOString());
    expect(times).not.toContain(localWallClockToUtc(DATE, 9 * 60).toISOString());
    expect(times).not.toContain(localWallClockToUtc(DATE, 9 * 60 + 30).toISOString());
    expect(times).toContain(localWallClockToUtc(DATE, 10 * 60).toISOString());
  });

  it('a staff member with no working window that day contributes no slots', () => {
    const slots = computeAvailableSlots({
      dateStr: DATE,
      durationMinutes: 30,
      stepMinutes: 30,
      now: FAR_PAST_NOW,
      staff: [{ staffId: 'staff-1', workingWindows: [], busy: [] }],
    });
    expect(slots).toEqual([]);
  });

  it('a different staff member is still available at the same time another is busy', () => {
    const slots = computeAvailableSlots({
      dateStr: DATE,
      durationMinutes: 30,
      stepMinutes: 30,
      now: FAR_PAST_NOW,
      staff: [
        {
          staffId: 'busy-staff',
          workingWindows: [{ startMinute: 9 * 60, endMinute: 10 * 60 }],
          busy: [{ startAt: localWallClockToUtc(DATE, 9 * 60), endAt: localWallClockToUtc(DATE, 9 * 60 + 30) }],
        },
        {
          staffId: 'free-staff',
          workingWindows: [{ startMinute: 9 * 60, endMinute: 10 * 60 }],
          busy: [],
        },
      ],
    });
    const nineOClock = slots.find((s) => s.startAt.getTime() === localWallClockToUtc(DATE, 9 * 60).getTime());
    expect(nineOClock?.availableStaffIds).toEqual(['free-staff']);
  });

  it('merges availability across staff into a single slot entry with combined staff ids', () => {
    const slots = computeAvailableSlots({
      dateStr: DATE,
      durationMinutes: 30,
      stepMinutes: 30,
      now: FAR_PAST_NOW,
      staff: [
        { staffId: 'staff-a', workingWindows: [{ startMinute: 9 * 60, endMinute: 10 * 60 }], busy: [] },
        { staffId: 'staff-b', workingWindows: [{ startMinute: 9 * 60, endMinute: 10 * 60 }], busy: [] },
      ],
    });
    const nineOClock = slots.find((s) => s.startAt.getTime() === localWallClockToUtc(DATE, 9 * 60).getTime());
    expect(nineOClock?.availableStaffIds).toEqual(['staff-a', 'staff-b']);
  });

  it('a service duration that does not fit before the window closes yields no slot for that window', () => {
    const slots = computeAvailableSlots({
      dateStr: DATE,
      durationMinutes: 90,
      stepMinutes: 30,
      now: FAR_PAST_NOW,
      staff: [{ staffId: 'staff-1', workingWindows: [{ startMinute: 9 * 60, endMinute: 10 * 60 }], busy: [] }],
    });
    expect(slots).toEqual([]);
  });

  it('returns slots sorted chronologically', () => {
    const slots = computeAvailableSlots({
      dateStr: DATE,
      durationMinutes: 30,
      stepMinutes: 30,
      now: FAR_PAST_NOW,
      staff: [{ staffId: 'staff-1', workingWindows: [{ startMinute: 9 * 60, endMinute: 11 * 60 }], busy: [] }],
    });
    const times = slots.map((s) => s.startAt.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
});
