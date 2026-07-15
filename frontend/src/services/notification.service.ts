import { customerNotifications, staffNotifications } from "@/fixtures/notifications";

export async function listCustomerNotifications() {
  return customerNotifications;
}

export async function listStaffNotifications() {
  return staffNotifications;
}
