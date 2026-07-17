import {
  parseTimeToMinutes,
  minutesToTimeString,
  localWallClockToUtc,
  localDayRangeUtc,
  localDayOfWeek,
  utcToLocalDateString,
  VN_UTC_OFFSET_MINUTES,
} from './timezone';

describe('parseTimeToMinutes / minutesToTimeString', () => {
  it('round-trips HH:MM through minutes-since-midnight', () => {
    expect(parseTimeToMinutes('09:30')).toBe(570);
    expect(parseTimeToMinutes('00:00')).toBe(0);
    expect(parseTimeToMinutes('23:45')).toBe(1425);
    expect(minutesToTimeString(570)).toBe('09:30');
    expect(minutesToTimeString(0)).toBe('00:00');
    expect(minutesToTimeString(1425)).toBe('23:45');
  });
});

describe('localWallClockToUtc', () => {
  it('booking 09:00 Asia/Ho_Chi_Minh is stored as 02:00 UTC (fixed UTC+7, no DST)', () => {
    const utc = localWallClockToUtc('2026-07-20', 9 * 60);
    expect(utc.toISOString()).toBe('2026-07-20T02:00:00.000Z');
  });

  it('crosses the UTC date boundary correctly for early-morning local times', () => {
    // 03:00 local on the 20th is still the 19th in UTC.
    const utc = localWallClockToUtc('2026-07-20', 3 * 60);
    expect(utc.toISOString()).toBe('2026-07-19T20:00:00.000Z');
  });

  it('is not affected by the host process TZ environment variable', () => {
    const original = process.env.TZ;
    try {
      process.env.TZ = 'America/New_York';
      const utc = localWallClockToUtc('2026-07-20', 9 * 60);
      expect(utc.toISOString()).toBe('2026-07-20T02:00:00.000Z');
    } finally {
      process.env.TZ = original;
    }
  });

  it('never shifts by DST — Vietnam has none, and the offset is a fixed constant', () => {
    // Sample a date that would be inside Northern Hemisphere DST if this code (incorrectly)
    // depended on a DST-aware timezone database instead of a fixed offset.
    const julUtc = localWallClockToUtc('2026-07-01', 9 * 60);
    const janUtc = localWallClockToUtc('2026-01-01', 9 * 60);
    expect(julUtc.getUTCHours()).toBe(2);
    expect(janUtc.getUTCHours()).toBe(2);
    expect(VN_UTC_OFFSET_MINUTES).toBe(7 * 60);
  });
});

describe('localDayRangeUtc', () => {
  it('returns a [startUtc, endUtc) pair spanning exactly 24 hours', () => {
    const { startUtc, endUtc } = localDayRangeUtc('2026-07-20');
    expect(endUtc.getTime() - startUtc.getTime()).toBe(24 * 60 * 60 * 1000);
    expect(startUtc.toISOString()).toBe('2026-07-19T17:00:00.000Z');
    expect(endUtc.toISOString()).toBe('2026-07-20T17:00:00.000Z');
  });
});

describe('localDayOfWeek', () => {
  it('matches JS Date#getDay() convention (0=Sunday..6=Saturday)', () => {
    // 2026-07-20 is a Monday.
    expect(localDayOfWeek('2026-07-20')).toBe(1);
    // 2026-07-19 is a Sunday.
    expect(localDayOfWeek('2026-07-19')).toBe(0);
  });
});

describe('utcToLocalDateString', () => {
  it('groups a late-night UTC instant into the correct next-day Vietnam date', () => {
    // 18:00 UTC on the 19th is 01:00 on the 20th in Vietnam — must not be grouped as the 19th.
    const date = new Date('2026-07-19T18:00:00.000Z');
    expect(utcToLocalDateString(date)).toBe('2026-07-20');
  });

  it('is the inverse of localWallClockToUtc at day boundaries', () => {
    const utc = localWallClockToUtc('2026-07-20', 0);
    expect(utcToLocalDateString(utc)).toBe('2026-07-20');
  });
});
