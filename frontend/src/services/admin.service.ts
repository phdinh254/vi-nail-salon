import { auditLogs } from "@/fixtures/audit-logs";
import { adminCustomers, getAdminCustomerByPhone } from "@/fixtures/admin-customers";
import { appointments } from "@/fixtures/appointments";

export async function listAuditLogs() {
  return auditLogs;
}

export async function listAdminCustomers() {
  return adminCustomers;
}

export async function getAdminCustomer(phone: string) {
  return getAdminCustomerByPhone(phone);
}

export async function listAllAppointments() {
  return appointments;
}
