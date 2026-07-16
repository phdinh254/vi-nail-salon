import type { Appointment } from "@/types/appointment";
import {
  lookupGuestAppointment as apiLookupGuestAppointment,
  guestReschedule as apiGuestReschedule,
  guestCancel as apiGuestCancel,
} from "@/services/appointment.service";

/**
 * Tra cứu lịch hẹn của khách vãng lai qua API thật: chỉ trả về đúng một lịch
 * hẹn khớp cả mã lịch hẹn lẫn số điện thoại. Ném lỗi `ApiError` khi không
 * tìm thấy hoặc thông tin tra cứu không hợp lệ — nơi gọi tự bắt và hiển thị.
 */
export async function lookupGuestAppointment(code: string, phone: string): Promise<Appointment> {
  return apiLookupGuestAppointment(code.trim().toUpperCase(), phone.trim().replace(/\s+/g, ""));
}

export async function rescheduleGuestAppointment(
  code: string,
  phone: string,
  startAt: string,
): Promise<Appointment> {
  return apiGuestReschedule(code.trim().toUpperCase(), phone.trim().replace(/\s+/g, ""), startAt);
}

export async function cancelGuestAppointment(code: string, phone: string): Promise<Appointment> {
  return apiGuestCancel(code.trim().toUpperCase(), phone.trim().replace(/\s+/g, ""));
}

export const canModifyStatuses: Appointment["status"][] = ["PENDING_CONFIRMATION", "CONFIRMED"];
