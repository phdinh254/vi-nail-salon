import { apiRequest } from "@/lib/api-client";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

type BackendAppointment = {
  id: string;
  code: string;
  status: AppointmentStatus;
  startAt: string;
  endAt: string;
  staffId: string | null;
  staff: { id: string; user: { name: string } } | null;
  customerName: string;
  customerPhone: string;
  nailDesignId: string | null;
  nailDesign: { id: string; name: string } | null;
  allergyNote: string | null;
  requestNote: string | null;
  totalPrice: number;
  totalDurationMinutes: number;
  depositAmount: number | null;
  createdVia: Appointment["createdVia"];
  services: { serviceId: string; serviceName: string; durationMinutes: number; price: number }[];
  timeline: { status: AppointmentStatus; at: string; note?: string | null }[];
};

function mapAppointment(raw: BackendAppointment): Appointment {
  return {
    id: raw.id,
    code: raw.code,
    status: raw.status,
    startAt: raw.startAt,
    endAt: raw.endAt,
    services: raw.services,
    staffId: raw.staffId,
    staffName: raw.staff?.user.name ?? null,
    customerName: raw.customerName,
    customerPhone: raw.customerPhone,
    nailDesignId: raw.nailDesignId,
    nailDesignName: raw.nailDesign?.name ?? null,
    allergyNote: raw.allergyNote,
    requestNote: raw.requestNote,
    totalPrice: raw.totalPrice,
    totalDurationMinutes: raw.totalDurationMinutes,
    depositAmount: raw.depositAmount,
    createdVia: raw.createdVia,
    timeline: raw.timeline.map((t) => ({ status: t.status, at: t.at, note: t.note ?? undefined })),
  };
}

// ---- guest flow ----

export type CreateGuestAppointmentInput = {
  customerName: string;
  serviceIds: string[];
  staffId?: string;
  startAt: string;
  nailDesignId?: string;
  allergyNote?: string;
  requestNote?: string;
};

export async function createGuestAppointment(
  input: CreateGuestAppointmentInput,
  bookingSessionToken: string,
): Promise<Appointment> {
  const raw = await apiRequest<BackendAppointment>("/appointments/guest", {
    method: "POST",
    body: input,
    token: bookingSessionToken,
  });
  return mapAppointment(raw);
}

export async function lookupGuestAppointment(code: string, phone: string): Promise<Appointment> {
  const raw = await apiRequest<BackendAppointment>("/appointments/lookup", {
    query: { code, phone },
    token: null,
  });
  return mapAppointment(raw);
}

export async function guestReschedule(code: string, phone: string, startAt: string): Promise<Appointment> {
  const raw = await apiRequest<BackendAppointment>("/appointments/guest/reschedule", {
    method: "PATCH",
    body: { code, phone, startAt },
    token: null,
  });
  return mapAppointment(raw);
}

export async function guestCancel(code: string, phone: string): Promise<Appointment> {
  const raw = await apiRequest<BackendAppointment>("/appointments/guest/cancel", {
    method: "PATCH",
    body: { code, phone },
    token: null,
  });
  return mapAppointment(raw);
}

// ---- authenticated flows (customer / staff / admin) ----

export async function getAppointment(id: string): Promise<Appointment> {
  const raw = await apiRequest<BackendAppointment>(`/appointments/${id}`);
  return mapAppointment(raw);
}

export async function listMyAppointments(): Promise<Appointment[]> {
  const raw = await apiRequest<BackendAppointment[]>("/appointments/customer/me");
  return raw.map(mapAppointment);
}

export async function listAppointmentsByPhone(phone: string): Promise<Appointment[]> {
  // Trang khách hàng đã đăng nhập: backend tự lọc theo phiên JWT hiện tại,
  // tham số phone chỉ giữ lại để tương thích chữ ký gọi cũ.
  void phone;
  return listMyAppointments();
}

export async function listAllAppointments(filter?: {
  status?: AppointmentStatus;
  staffId?: string;
}): Promise<Appointment[]> {
  const raw = await apiRequest<BackendAppointment[]>("/appointments", { query: filter });
  return raw.map(mapAppointment);
}

export async function listAppointmentsByStaff(staffId?: string): Promise<Appointment[]> {
  // Backend tự suy ra nhân viên hiện tại từ JWT khi role = STAFF.
  void staffId;
  const raw = await apiRequest<BackendAppointment[]>("/appointments");
  return raw.map(mapAppointment);
}

export type CreateStaffAppointmentInput = CreateGuestAppointmentInput & { customerPhone: string };

export async function createStaffAppointment(input: CreateStaffAppointmentInput): Promise<Appointment> {
  const raw = await apiRequest<BackendAppointment>("/appointments/staff", { method: "POST", body: input });
  return mapAppointment(raw);
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  note?: string,
): Promise<Appointment> {
  const raw = await apiRequest<BackendAppointment>(`/appointments/${id}/status`, {
    method: "PATCH",
    body: { status, note },
  });
  return mapAppointment(raw);
}

export async function assignStaff(id: string, staffId: string): Promise<Appointment> {
  const raw = await apiRequest<BackendAppointment>(`/appointments/${id}/assign`, {
    method: "PATCH",
    body: { staffId },
  });
  return mapAppointment(raw);
}

export async function issueGuestAccessToken(id: string): Promise<string> {
  const result = await apiRequest<{ token: string }>(`/appointments/${id}/guest-access`, { method: "POST" });
  return result.token;
}
