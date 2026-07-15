import { appointments } from "@/fixtures/appointments";
import type { Appointment } from "@/types/appointment";

/**
 * Tra cứu minh họa cho khu vực Guest: chỉ trả về đúng một lịch hẹn khớp cả
 * mã lịch hẹn lẫn số điện thoại — không bao giờ trả về danh sách nhiều lịch.
 * Khi có backend, thay bằng phiên truy cập được cấp qua magic link/OTP.
 */
export function lookupGuestAppointment(code: string, phone: string): Appointment | null {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedPhone = phone.trim().replace(/\s+/g, "");
  const match = appointments.find(
    (appointment) =>
      appointment.code.toUpperCase() === normalizedCode && appointment.customerPhone === normalizedPhone,
  );
  return match ?? null;
}

export const canModifyStatuses: Appointment["status"][] = ["PENDING_CONFIRMATION", "CONFIRMED"];
