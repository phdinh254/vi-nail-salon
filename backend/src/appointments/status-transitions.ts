import type { AppointmentStatus } from '@prisma/client';

export const STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING_CONFIRMATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW'],
  CHECKED_IN: ['IN_SERVICE', 'CANCELLED'],
  IN_SERVICE: ['COMPLETED'],
  COMPLETED: [],
  NO_SHOW: [],
  CANCELLED: [],
};

/** A no-op "transition" (same -> same) is always allowed — callers use this to make an update
 * idempotent rather than special-casing "already in that state" everywhere. */
export function isValidStatusTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return from === to || STATUS_TRANSITIONS[from].includes(to);
}
