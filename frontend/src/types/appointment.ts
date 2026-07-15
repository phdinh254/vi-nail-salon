export const APPOINTMENT_STATUSES = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_SERVICE",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const appointmentStatusLabel: Record<AppointmentStatus, string> = {
  PENDING_CONFIRMATION: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Khách đã đến",
  IN_SERVICE: "Đang phục vụ",
  COMPLETED: "Đã hoàn thành",
  NO_SHOW: "Khách không đến",
  CANCELLED: "Đã hủy",
};

export type AppointmentTimelineEntry = {
  status: AppointmentStatus;
  at: string;
  note?: string;
};

export type AppointmentServiceLine = {
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  price: number;
};

export type Appointment = {
  id: string;
  code: string;
  status: AppointmentStatus;
  startAt: string;
  endAt: string;
  services: AppointmentServiceLine[];
  staffId: string | null;
  staffName: string | null;
  customerName: string;
  customerPhone: string;
  nailDesignId: string | null;
  nailDesignName: string | null;
  allergyNote: string | null;
  requestNote: string | null;
  totalPrice: number;
  totalDurationMinutes: number;
  depositAmount: number | null;
  createdVia: "GUEST" | "CUSTOMER" | "STAFF" | "ADMIN";
  timeline: AppointmentTimelineEntry[];
};
