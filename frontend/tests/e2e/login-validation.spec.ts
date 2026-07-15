import { test, expect } from "@playwright/test";

test("login form validates phone and password before submitting", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByText("Số điện thoại không hợp lệ.")).toBeVisible();
  await expect(page.getByText("Mật khẩu cần tối thiểu 6 ký tự.")).toBeVisible();

  await page.getByLabel("Số điện thoại").fill("0909111222");
  await page.getByLabel("Mật khẩu").fill("123456");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page.getByText("Giao diện xem trước")).toBeVisible();
  await expect(page.getByText("Đăng nhập sẽ hoạt động khi kết nối hệ thống xác thực thật.")).toBeVisible();
});

test("login page links to register and forgot-password", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("link", { name: "Quên mật khẩu?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);

  await page.goBack();
  await page.getByRole("link", { name: "Tạo tài khoản" }).click();
  await expect(page).toHaveURL(/\/register$/);
});
