import { test, expect } from "@playwright/test";

test("guest can look up a single appointment by code and phone", async ({ page }) => {
  await page.goto("/guest-booking");

  await page.getByLabel("Mã lịch hẹn").fill("VN-1002");
  await page.getByLabel("Số điện thoại đã đặt lịch").fill("0977445566");
  await page.getByRole("button", { name: "Tra cứu lịch hẹn" }).click();

  await expect(page).toHaveURL(/\/guest-booking\?code=VN-1002/);
  await expect(page.getByRole("heading", { name: "Lịch hẹn của bạn" })).toBeVisible();
  await expect(page.getByText("Mã lịch hẹn VN-1002")).toBeVisible();
  await expect(page.getByText("Chờ xác nhận").first()).toBeVisible();
});

test("guest lookup shows an error for a non-matching code and phone", async ({ page }) => {
  await page.goto("/guest-booking");

  await page.getByLabel("Mã lịch hẹn").fill("VN-9999");
  await page.getByLabel("Số điện thoại đã đặt lịch").fill("0900000000");
  await page.getByRole("button", { name: "Tra cứu lịch hẹn" }).click();

  await expect(page.getByText("Không tìm thấy lịch hẹn")).toBeVisible();
});
