import { test, expect } from "@playwright/test";

test("guest can look up a single appointment by code and phone", async ({ page }) => {
  // VN-1001 / 0909111222 is seeded by backend/prisma/seed.ts (status: CONFIRMED).
  await page.goto("/guest-booking");

  await page.getByLabel("Mã lịch hẹn").fill("VN-1001");
  await page.getByLabel("Số điện thoại đã đặt lịch").fill("0909111222");
  await page.getByRole("button", { name: "Tra cứu lịch hẹn" }).click();

  await expect(page.getByRole("heading", { name: "Lịch hẹn của bạn" })).toBeVisible();
  await expect(page.getByText("Mã lịch hẹn VN-1001")).toBeVisible();
  await expect(page.getByText("Đã xác nhận").first()).toBeVisible();
});

test("guest lookup shows an error for a non-matching code and phone", async ({ page }) => {
  await page.goto("/guest-booking");

  await page.getByLabel("Mã lịch hẹn").fill("VN-9999");
  await page.getByLabel("Số điện thoại đã đặt lịch").fill("0900000000");
  await page.getByRole("button", { name: "Tra cứu lịch hẹn" }).click();

  await expect(page.getByText("Không tìm thấy lịch hẹn")).toBeVisible();
});
