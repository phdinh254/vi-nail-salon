import { apiRequest } from "@/lib/api-client";
import type { TimeOffRequest } from "@/types/time-off";

export async function listMyTimeOff(): Promise<TimeOffRequest[]> {
  return apiRequest<TimeOffRequest[]>("/time-off/me");
}

export async function listAllTimeOff(): Promise<TimeOffRequest[]> {
  return apiRequest<TimeOffRequest[]>("/time-off");
}

export async function requestTimeOff(input: {
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<TimeOffRequest> {
  return apiRequest<TimeOffRequest>("/time-off", { method: "POST", body: input });
}

export async function updateTimeOffStatus(
  id: string,
  status: "APPROVED" | "REJECTED",
): Promise<TimeOffRequest> {
  return apiRequest<TimeOffRequest>(`/time-off/${id}/status`, { method: "PATCH", body: { status } });
}
