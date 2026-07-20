export type TimeOffStatus = "PENDING" | "APPROVED" | "REJECTED";

export type TimeOffRequest = {
  id: string;
  staffId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: TimeOffStatus;
  createdAt: string;
};

export const timeOffStatusLabel: Record<TimeOffStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};
