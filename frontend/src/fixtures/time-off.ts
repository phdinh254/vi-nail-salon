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

export const timeOffRequests: TimeOffRequest[] = [
  {
    id: "off-1",
    staffId: "staff-ngoc-bich",
    startDate: "2026-07-25",
    endDate: "2026-07-26",
    reason: "Việc gia đình",
    status: "APPROVED",
    createdAt: "2026-07-10T09:00:00+07:00",
  },
  {
    id: "off-2",
    staffId: "staff-ngoc-bich",
    startDate: "2026-08-02",
    endDate: "2026-08-02",
    reason: "Khám sức khỏe định kỳ",
    status: "PENDING",
    createdAt: "2026-07-14T14:00:00+07:00",
  },
];
