import { apiRequest } from "@/lib/api-client";
import type { AvailabilityResponse } from "@/types/availability";

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getAvailability(params: {
  date: Date;
  serviceIds: string[];
  staffId?: string | null;
}): Promise<AvailabilityResponse> {
  return apiRequest<AvailabilityResponse>("/availability", {
    query: {
      date: toDateString(params.date),
      serviceIds: params.serviceIds.join(","),
      staffId: params.staffId && params.staffId !== "ANY" ? params.staffId : undefined,
    },
  });
}
