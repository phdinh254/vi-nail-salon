import { apiRequest } from "@/lib/api-client";
import type { AuditLogEntry } from "@/types/audit-log";
import type { AdminCustomer } from "@/types/customer";
import type { Payment, PaymentMethod } from "@/types/payment";
import { listAllAppointments as listAllAppointmentsRaw } from "@/services/appointment.service";

export async function listAuditLogs(): Promise<AuditLogEntry[]> {
  return apiRequest<AuditLogEntry[]>("/audit-logs");
}

export const listAllAppointments = listAllAppointmentsRaw;

/**
 * Không có model "khách hàng" riêng trên backend — danh sách khách hàng
 * quản trị được suy ra từ lịch sử lịch hẹn (nhóm theo số điện thoại).
 */
export async function listAdminCustomers(): Promise<AdminCustomer[]> {
  const appointments = await listAllAppointmentsRaw();
  const byPhone = new Map<string, AdminCustomer>();

  for (const appt of appointments) {
    const existing = byPhone.get(appt.customerPhone);
    if (!existing) {
      byPhone.set(appt.customerPhone, {
        id: appt.customerPhone,
        name: appt.customerName,
        phone: appt.customerPhone,
        accountType: appt.createdVia === "GUEST" ? "GUEST" : "CUSTOMER",
        totalVisits: 1,
        lastVisitAt: appt.startAt,
        note: null,
      });
      continue;
    }
    existing.totalVisits += 1;
    if (new Date(appt.startAt) > new Date(existing.lastVisitAt ?? 0)) {
      existing.lastVisitAt = appt.startAt;
      existing.name = appt.customerName;
    }
    if (appt.createdVia !== "GUEST") existing.accountType = "CUSTOMER";
  }

  return Array.from(byPhone.values()).sort(
    (a, b) => new Date(b.lastVisitAt ?? 0).getTime() - new Date(a.lastVisitAt ?? 0).getTime(),
  );
}

export async function getAdminCustomer(phone: string): Promise<AdminCustomer | undefined> {
  const customers = await listAdminCustomers();
  return customers.find((c) => c.phone === phone);
}

// ---- payments ----

export async function listPayments(): Promise<Payment[]> {
  const raw = await apiRequest<
    { id: string; appointmentId: string; amount: number; method: PaymentMethod; status: Payment["status"]; paidAt: string; appointment: { code: string; customerName: string } }[]
  >("/payments");
  return raw.map((p) => ({
    id: p.id,
    appointmentId: p.appointmentId,
    appointmentCode: p.appointment.code,
    customerName: p.appointment.customerName,
    amount: p.amount,
    method: p.method,
    status: p.status,
    paidAt: p.paidAt,
  }));
}

export async function createPayment(input: {
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
}): Promise<void> {
  await apiRequest("/payments", { method: "POST", body: input });
}

export async function refundPayment(id: string): Promise<void> {
  await apiRequest(`/payments/${id}/refund`, { method: "PATCH" });
}
