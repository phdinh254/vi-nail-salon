export type AvailabilitySlot = {
  startAt: string;
  endAt: string;
  availableStaffIds: string[];
};

export type AvailabilityResponse = {
  date: string;
  timezone: string;
  durationMinutes: number;
  slots: AvailabilitySlot[];
};
