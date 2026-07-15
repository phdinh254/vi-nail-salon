import { describe, expect, it } from "vitest";
import { lookupGuestAppointment } from "@/features/guest-booking/lookup";

describe("lookupGuestAppointment", () => {
  it("returns the appointment when code and phone match", () => {
    const result = lookupGuestAppointment("VN-1002", "0977445566");
    expect(result).not.toBeNull();
    expect(result?.code).toBe("VN-1002");
  });

  it("is case-insensitive on the appointment code", () => {
    const result = lookupGuestAppointment("vn-1002", "0977445566");
    expect(result).not.toBeNull();
  });

  it("returns null when the phone does not match the code", () => {
    const result = lookupGuestAppointment("VN-1002", "0909111222");
    expect(result).toBeNull();
  });

  it("returns null for an unknown code", () => {
    const result = lookupGuestAppointment("VN-9999", "0977445566");
    expect(result).toBeNull();
  });
});
