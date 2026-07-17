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

  // Every page checks for an existing session on load (GET /auth/me, sent automatically via
  // the httpOnly cookie). A logged-out guest correctly gets a 401 for that check — Chromium
  // logs failed resource loads to the console regardless of the app handling them gracefully,
  // so this specific message is expected here and isn't a real error.
  const unexpected = errors.filter(
    (e) => !(e.includes("401") && e.toLowerCase().includes("failed to load resource")),
  );
  expect(unexpected, `Unexpected console/page errors: ${unexpected.join("; ")}`).toEqual([]);
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
