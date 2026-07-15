import type { NotificationItem } from "@/types/notification";

export const customerNotifications: NotificationItem[] = [
  {
    id: "noti-1",
    title: "Lịch hẹn đã được xác nhận",
    description: "Lịch hẹn VN-1001 lúc 10:00 ngày 15/07/2026 đã được xác nhận.",
    createdAt: "2026-07-13T09:10:00+07:00",
    isRead: false,
    type: "APPOINTMENT",
  },
  {
    id: "noti-2",
    title: "Ưu đãi mới dành cho bạn",
    description: "Giảm 10% cho lịch hẹn trong khung giờ vàng buổi sáng.",
    createdAt: "2026-07-10T08:00:00+07:00",
    isRead: true,
    type: "PROMOTION",
  },
  {
    id: "noti-3",
    title: "Nhắc lịch hẹn sắp tới",
    description: "Bạn có lịch hẹn VN-1008 vào 13:00 ngày 18/07/2026.",
    createdAt: "2026-07-14T20:31:00+07:00",
    isRead: false,
    type: "APPOINTMENT",
  },
];

export const staffNotifications: NotificationItem[] = [
  {
    id: "s-noti-1",
    title: "Lịch mới được phân công",
    description: "Bạn được phân công lịch VN-1009 lúc 16:00 hôm nay.",
    createdAt: "2026-07-14T15:20:00+07:00",
    isRead: false,
    type: "APPOINTMENT",
  },
  {
    id: "s-noti-2",
    title: "Khách đổi giờ hẹn",
    description: "Lịch VN-1011 đã được xác nhận cho ngày 20/07/2026.",
    createdAt: "2026-07-15T09:41:00+07:00",
    isRead: false,
    type: "APPOINTMENT",
  },
];
