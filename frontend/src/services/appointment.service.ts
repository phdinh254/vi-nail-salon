import {
  getAppointmentById,
  getAppointmentsByPhone,
  getAppointmentsByStaffId,
} from "@/fixtures/appointments";

export async function getAppointment(id: string) {
  return getAppointmentById(id);
}

export async function listAppointmentsByPhone(phone: string) {
  return getAppointmentsByPhone(phone);
}

export async function listAppointmentsByStaff(staffId: string) {
  return getAppointmentsByStaffId(staffId);
}
