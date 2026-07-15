import type { AuditLogEntry } from "@/types/audit-log";

export const auditLogs: AuditLogEntry[] = [
  {
    id: "log-1",
    actorName: "Quản trị viên Hồng Vân",
    actorRole: "ADMIN",
    action: "Xác nhận lịch hẹn",
    resourceType: "Lịch hẹn",
    resourceLabel: "VN-1002",
    createdAt: "2026-07-15T08:20:00+07:00",
  },
  {
    id: "log-2",
    actorName: "Nguyễn Thị Lan",
    actorRole: "STAFF",
    action: "Check-in khách hàng",
    resourceType: "Lịch hẹn",
    resourceLabel: "VN-1003",
    createdAt: "2026-07-15T08:55:00+07:00",
  },
  {
    id: "log-3",
    actorName: "Quản trị viên Hồng Vân",
    actorRole: "ADMIN",
    action: "Cập nhật giá dịch vụ",
    resourceType: "Dịch vụ",
    resourceLabel: "Nối Gel Toàn Bộ",
    createdAt: "2026-07-14T17:00:00+07:00",
  },
  {
    id: "log-4",
    actorName: "Hệ thống",
    actorRole: "SYSTEM",
    action: "Đánh dấu khách không đến",
    resourceType: "Lịch hẹn",
    resourceLabel: "VN-1005",
    createdAt: "2026-07-14T09:20:00+07:00",
  },
  {
    id: "log-5",
    actorName: "Quản trị viên Hồng Vân",
    actorRole: "ADMIN",
    action: "Tạo chương trình ưu đãi",
    resourceType: "Ưu đãi",
    resourceLabel: "Giờ Vàng Buổi Sáng",
    createdAt: "2026-07-10T10:00:00+07:00",
  },
];
