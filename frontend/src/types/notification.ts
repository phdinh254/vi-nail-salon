export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  type: "APPOINTMENT" | "PROMOTION" | "SYSTEM";
};
