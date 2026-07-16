import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { lookupGuestAppointment } from "@/features/guest-booking/lookup";
import * as appointmentService from "@/services/appointment.service";
import { ApiError } from "@/lib/api-client";
import type { Appointment } from "@/types/appointment";

const sampleAppointment: Appointment = {
  id: "apt-1",
  code: "VN-1002",
  status: "CONFIRMED",
  startAt: "2026-08-01T02:00:00.000Z",
  endAt: "2026-08-01T03:00:00.000Z",
  services: [],
  staffId: null,
  staffName: null,
  customerName: "Khách hàng",
  customerPhone: "0977445566",
  nailDesignId: null,
  nailDesignName: null,
  allergyNote: null,
  requestNote: null,
  totalPrice: 0,
  totalDurationMinutes: 0,
  depositAmount: null,
  createdVia: "GUEST",
  timeline: [],
};

describe("lookupGuestAppointment", () => {
  beforeEach(() => {
    vi.spyOn(appointmentService, "lookupGuestAppointment");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the appointment when the API finds a match", async () => {
    vi.mocked(appointmentService.lookupGuestAppointment).mockResolvedValue(sampleAppointment);
    const result = await lookupGuestAppointment("VN-1002", "0977445566");
    expect(result.code).toBe("VN-1002");
  });

  it("normalizes the code to uppercase and trims the phone before calling the API", async () => {
    vi.mocked(appointmentService.lookupGuestAppointment).mockResolvedValue(sampleAppointment);
    await lookupGuestAppointment("vn-1002", " 0977445566 ");
    expect(appointmentService.lookupGuestAppointment).toHaveBeenCalledWith("VN-1002", "0977445566");
  });

  it("propagates the ApiError when the API cannot find a matching appointment", async () => {
    vi.mocked(appointmentService.lookupGuestAppointment).mockRejectedValue(new ApiError(404, "Không tìm thấy lịch hẹn."));
    await expect(lookupGuestAppointment("VN-9999", "0977445566")).rejects.toBeInstanceOf(ApiError);
  });
});
