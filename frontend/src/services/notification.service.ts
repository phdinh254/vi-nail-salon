import { apiRequest } from "@/lib/api-client";
import type { NotificationItem } from "@/types/notification";

export async function listCustomerNotifications(): Promise<NotificationItem[]> {
  return apiRequest<NotificationItem[]>("/notifications/me");
}

export async function listStaffNotifications(): Promise<NotificationItem[]> {
  return apiRequest<NotificationItem[]>("/notifications/me");
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
}
