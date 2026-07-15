import { describe, expect, it } from "vitest";
import {
  formatCurrencyVND,
  formatDurationMinutes,
  formatPriceRange,
  isValidVietnamesePhone,
  maskPhoneNumber,
} from "@/utils/format";

describe("formatCurrencyVND", () => {
  it("formats whole numbers as VND currency", () => {
    expect(formatCurrencyVND(180000)).toContain("180.000");
  });
});

describe("formatPriceRange", () => {
  it("returns a single price when from equals to", () => {
    expect(formatPriceRange(120000)).toBe(formatCurrencyVND(120000));
  });

  it("returns a range when prices differ", () => {
    expect(formatPriceRange(200000, 250000)).toContain("-");
  });
});

describe("formatDurationMinutes", () => {
  it("formats minutes under an hour", () => {
    expect(formatDurationMinutes(45)).toBe("45 phút");
  });

  it("formats exact hours without leftover minutes", () => {
    expect(formatDurationMinutes(60)).toBe("1 giờ");
  });

  it("formats hours with leftover minutes", () => {
    expect(formatDurationMinutes(100)).toBe("1 giờ 40 phút");
  });
});

describe("isValidVietnamesePhone", () => {
  it("accepts valid Vietnamese mobile numbers", () => {
    expect(isValidVietnamesePhone("0909111222")).toBe(true);
    expect(isValidVietnamesePhone("+84909111222")).toBe(true);
  });

  it("rejects invalid phone numbers", () => {
    expect(isValidVietnamesePhone("123")).toBe(false);
    expect(isValidVietnamesePhone("0109111222")).toBe(false);
  });
});

describe("maskPhoneNumber", () => {
  it("masks the middle digits of a phone number", () => {
    expect(maskPhoneNumber("0977445566")).toBe("0977 *** 566");
  });
});
