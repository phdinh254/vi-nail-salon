import { test, expect } from "@playwright/test";

test("landing page renders brand and hero without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("/");

  await expect(page).toHaveTitle(/Vi Nail/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Chăm sóc đôi tay");
  await expect(page.getByRole("link", { name: "Đặt lịch ngay" }).first()).toBeVisible();

  expect(errors, `Unexpected console/page errors: ${errors.join("; ")}`).toEqual([]);
});

test("desktop navigation links lead to their pages", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
  await expect(nav).toBeVisible();
  await nav.getByRole("link", { name: "Dịch vụ" }).click();

  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dịch vụ");
});

test("mobile drawer menu opens and navigates", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await page.getByRole("button", { name: "Mở menu" }).click();
  await page.getByRole("navigation", { name: "Điều hướng di động" }).getByRole("link", { name: "Dịch vụ" }).click();

  await expect(page).toHaveURL(/\/services$/);
});
