import { test, expect } from "@playwright/test";

test("login form validates phone and password before submitting", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByText("Số điện thoại không hợp lệ.")).toBeVisible();
  await expect(page.getByText("Mật khẩu cần tối thiểu 6 ký tự.")).toBeVisible();

  // 0909111222 is seeded (backend/prisma/seed.ts) with password "change-me-123" — using the
  // wrong password here exercises the real backend's 401 response.
  await page.getByLabel("Số điện thoại").fill("0909111222");
  await page.getByLabel("Mật khẩu").fill("wrong-password");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page.getByText("Đăng nhập thất bại")).toBeVisible();
});

test("login page links to register and forgot-password", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("link", { name: "Quên mật khẩu?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);

  await page.goBack();
  await page.getByRole("link", { name: "Tạo tài khoản" }).click();
  await expect(page).toHaveURL(/\/register$/);
});
