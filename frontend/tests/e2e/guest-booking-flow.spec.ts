import { test, expect } from "@playwright/test";

test("guest can complete the full booking flow without an account", async ({ page }) => {
  await page.goto("/booking/services");

  await page.locator("button", { hasText: "Manicure Cơ Bản" }).first().click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();

  await expect(page).toHaveURL(/\/booking\/staff$/);
  await page.getByRole("button", { name: /Bất kỳ nhân viên nào/ }).click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();

  await expect(page).toHaveURL(/\/booking\/schedule$/);
  await page.locator('[aria-current="date"]').click();
  const firstSlot = page.locator('[role="radiogroup"] button:not([disabled])').first();
  await expect(firstSlot).toBeVisible({ timeout: 5000 });
  await firstSlot.click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();

  await expect(page).toHaveURL(/\/booking\/customer-info$/);
  await page.getByLabel("Họ và tên").fill("Nguyễn Test E2E");
  await page.getByLabel("Số điện thoại").fill("0977445566");
  await page.getByRole("button", { name: "Tiếp tục" }).click();

  await expect(page).toHaveURL(/\/booking\/verify-otp$/);
  const otpInputs = page.locator('[role="group"][aria-label="Mã xác minh OTP"] input');
  await expect(otpInputs.first()).toBeVisible({ timeout: 5000 });
  for (let i = 0; i < 6; i += 1) {
    await otpInputs.nth(i).fill(String((i % 9) + 1));
  }
  await page.getByRole("button", { name: "Xác minh" }).click();

  await expect(page).toHaveURL(/\/booking\/review$/, { timeout: 5000 });
  await page.getByRole("button", { name: "Xác nhận đặt lịch" }).click();

  await expect(page).toHaveURL(/\/booking\/success$/, { timeout: 5000 });
  await expect(page.getByRole("heading", { name: "Đặt lịch thành công" })).toBeVisible();
  await expect(page.getByText(/^VN-\d+$/)).toBeVisible();
});
