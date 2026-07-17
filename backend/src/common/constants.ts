import type { AppointmentStatus } from '@prisma/client';

export const VIETNAM_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

/** Appointment statuses that do NOT hold a staff member's time slot — matches the
 * `appointments_no_staff_overlap` exclusion constraint's WHERE clause (see migration
 * 20260716182339) and must stay in sync with it. Used everywhere blocking/free time is decided:
 * the app-level conflict pre-check, the availability engine, and the DB constraint itself. */
export const NON_BLOCKING_APPOINTMENT_STATUSES: AppointmentStatus[] = ['CANCELLED', 'NO_SHOW'];

export const OTP_LENGTH = 6;
export const OTP_TTL_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export const BOOKING_SESSION_TTL_MINUTES = 30;
export const GUEST_ACCESS_TOKEN_TTL_MINUTES = 15;

export const ACCESS_TOKEN_TTL_MINUTES = 15;
export const REFRESH_TOKEN_TTL_DAYS = 30;
export const ACCESS_TOKEN_COOKIE = 'vi_nail_access_token';
export const REFRESH_TOKEN_COOKIE = 'vi_nail_refresh_token';
export const CSRF_TOKEN_COOKIE = 'vi_nail_csrf_token';
export const CSRF_TOKEN_HEADER = 'x-csrf-token';

/** Header an E2E test presents to prove it's allowed to read the test-only OTP mailbox. */
export const TEST_SECRET_HEADER = 'x-test-secret';

/** Availability slots are generated at this granularity, e.g. 09:00, 09:15, 09:30, ... */
export const AVAILABILITY_STEP_MINUTES = 15;
/** How many days ahead the availability endpoint will compute for — guards against
 * unbounded/expensive date-range abuse. */
export const AVAILABILITY_MAX_DAYS_AHEAD = 60;
