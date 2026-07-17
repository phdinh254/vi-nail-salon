import { test, expect, type APIRequestContext } from "@playwright/test";

// Runs against the isolated test stack (devops/docker-compose.test.yml), not the regular dev
// stack — only there does the backend run with NODE_ENV=test and expose the test-only OTP
// mailbox endpoint this test needs to get a real, verifiable code (see backend/src/testing/).
// Absolute URLs are used throughout instead of relying on Playwright's `baseURL` config
// (which points at the regular dev stack on :3000) so this file needs no config override.
const FRONTEND_URL = "http://localhost:3010";
const BACKEND_URL = "http://localhost:3011/api";
const TEST_SECRET = process.env.TEST_SECRET ?? "change-me-test-secret";

function uniquePhone(): string {
  // 09 + a random 8-digit suffix — chromium and mobile-chrome run this test in parallel, so a
  // timestamp alone isn't safe (both workers can land on the same millisecond and collide in
  // the OTP mailbox, which is keyed by phone). Always a syntactically valid VN mobile number.
  const suffix = Math.floor(10_000_000 + Math.random() * 90_000_000);
  return `09${suffix}`;
}

/**
 * The specific-staff slot-collision test below needs a date that's unlikely to collide with
 * concurrent/repeated runs of the same test picking the same "first available slot" for the
 * same staff member — clicking "today" every time would make every run (and every parallel
 * worker) fight over the exact same slot. Picks a random WEEKDAY still inside the currently
 * displayed month (both seeded staff members only work Monday-Friday — a weekend pick would
 * have zero availability for either of them, which is a real "no slots" result, not a bug, but
 * would make this specific test fail for an unrelated reason) so it stays reachable with a
 * single click, no calendar-navigation needed.
 */
function randomFutureWeekdayInCurrentMonth(): string {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const candidates: number[] = [];
  for (let day = now.getDate() + 1; day <= daysInMonth; day += 1) {
    const dayOfWeek = new Date(now.getFullYear(), now.getMonth(), day).getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) candidates.push(day);
  }
  // Falls back to tomorrow if the current month has no weekday left (e.g. testing on the 30th
  // of a month ending on a weekend) — the test may then hit a real "no slots" case, which is an
  // acceptable rare edge case rather than something worth cross-month calendar navigation for.
  const chosen = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : now.getDate() + 1;
  return String(chosen);
}

async function fetchRealOtp(request: APIRequestContext, phone: string): Promise<string> {
  const res = await request.get(`${BACKEND_URL}/test-only/otp`, {
    params: { phone },
    headers: { "x-test-secret": TEST_SECRET },
  });
  expect(res.ok(), `test-only OTP mailbox request failed: ${res.status()}`).toBeTruthy();
  const body = (await res.json()) as { code: string };
  return body.code;
}

test("guest can complete the full booking flow without an account, through the real OTP", async ({
  page,
  request,
}) => {
  const phone = uniquePhone();

  await page.goto(`${FRONTEND_URL}/booking/services`);
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
  await page.getByLabel("Số điện thoại").fill(phone);
  await page.getByRole("button", { name: "Tiếp tục" }).click();

  // Real request/response round trip through the backend — no fixed date, no console scraping.
  // The OTP request itself fires from an effect after this page mounts, and the input group
  // only renders once that call resolves — wait for it before reading the mailbox, or the
  // read can race ahead of the backend actually having stored the code.
  await expect(page).toHaveURL(/\/booking\/verify-otp$/);
  const otpInputs = page.locator('[role="group"][aria-label="Mã xác minh OTP"] input');
  await expect(otpInputs.first()).toBeVisible({ timeout: 5000 });
  const code = await fetchRealOtp(request, phone);
  for (let i = 0; i < 6; i += 1) {
    await otpInputs.nth(i).fill(code[i]);
  }
  await page.getByRole("button", { name: "Xác minh" }).click();

  await expect(page).toHaveURL(/\/booking\/review$/, { timeout: 5000 });
  await page.getByRole("button", { name: "Xác nhận đặt lịch" }).click();

  await expect(page).toHaveURL(/\/booking\/success$/, { timeout: 5000 });
  await expect(page.getByRole("heading", { name: "Đặt lịch thành công" })).toBeVisible();
  const codeText = await page.getByText(/^VN-\d+$/).textContent();
  const appointmentCode = codeText!.trim();

  // Verify the appointment is real (present via the API, not just rendered client state),
  // then exercise lookup and cancel through the real UI + backend.
  const lookupApiRes = await request.get(`${BACKEND_URL}/appointments/lookup`, {
    params: { code: appointmentCode, phone },
  });
  expect(lookupApiRes.ok()).toBeTruthy();
  const appointment = (await lookupApiRes.json()) as { status: string; customerName: string };
  expect(appointment.status).toBe("PENDING_CONFIRMATION");
  expect(appointment.customerName).toBe("Nguyễn Test E2E");

  await page.goto(`${FRONTEND_URL}/guest-booking?code=${appointmentCode}&phone=${phone}`);
  await expect(page.getByText(`Mã lịch hẹn ${appointmentCode}`)).toBeVisible();

  await page.goto(`${FRONTEND_URL}/guest-booking/cancel?code=${appointmentCode}&phone=${phone}`);
  await page.getByRole("button", { name: "Hủy lịch hẹn" }).click();
  await page.getByRole("button", { name: "Xác nhận hủy" }).click();
  await expect(page.getByRole("heading", { name: "Đã hủy lịch hẹn" })).toBeVisible({ timeout: 5000 });

  // Cleanup / final verification: confirm the cancellation actually persisted server-side.
  const finalState = await request.get(`${BACKEND_URL}/appointments/lookup`, {
    params: { code: appointmentCode, phone },
  });
  const finalAppointment = (await finalState.json()) as { status: string };
  expect(finalAppointment.status).toBe("CANCELLED");
});

test("a booked slot disappears from real availability, then reappears after cancellation", async ({
  page,
  request,
}) => {
  const phone = uniquePhone();
  const targetDay = randomFutureWeekdayInCurrentMonth();

  await page.goto(`${FRONTEND_URL}/booking/services`);
  await page.locator("button", { hasText: "Manicure Cơ Bản" }).first().click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();

  // Pick a specific staff member (not "Bất kỳ") so the slot-disappears check below is
  // unambiguous — with "any staff", a slot only truly disappears once every eligible staff
  // member is booked for it.
  await expect(page).toHaveURL(/\/booking\/staff$/);
  await page.locator('button[aria-pressed]').filter({ hasNotText: "Bất kỳ nhân viên nào" }).first().click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();

  await expect(page).toHaveURL(/\/booking\/schedule$/);
  await page.getByRole("button", { name: targetDay, exact: true }).click();
  const radiogroup = page.locator('[role="radiogroup"]');
  const firstSlot = radiogroup.locator("button:not([disabled])").first();
  await expect(firstSlot).toBeVisible({ timeout: 5000 });
  const slotLabel = (await firstSlot.textContent())!.trim();
  await firstSlot.click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();

  await expect(page).toHaveURL(/\/booking\/customer-info$/);
  await page.getByLabel("Họ và tên").fill("Nguyễn Slot Test");
  await page.getByLabel("Số điện thoại").fill(phone);
  await page.getByRole("button", { name: "Tiếp tục" }).click();

  await expect(page).toHaveURL(/\/booking\/verify-otp$/);
  const otpInputs = page.locator('[role="group"][aria-label="Mã xác minh OTP"] input');
  await expect(otpInputs.first()).toBeVisible({ timeout: 5000 });
  const code = await fetchRealOtp(request, phone);
  for (let i = 0; i < 6; i += 1) {
    await otpInputs.nth(i).fill(code[i]);
  }
  await page.getByRole("button", { name: "Xác minh" }).click();

  await expect(page).toHaveURL(/\/booking\/review$/, { timeout: 5000 });
  await page.getByRole("button", { name: "Xác nhận đặt lịch" }).click();
  await expect(page).toHaveURL(/\/booking\/success$/, { timeout: 5000 });
  const codeText = await page.getByText(/^VN-\d+$/).textContent();
  const appointmentCode = codeText!.trim();

  // Re-run the exact same booking flow (same service, same staff, same date) — real
  // availability must no longer offer the slot we just took.
  await page.goto(`${FRONTEND_URL}/booking/services`);
  await page.locator("button", { hasText: "Manicure Cơ Bản" }).first().click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(page).toHaveURL(/\/booking\/staff$/);
  await page.locator('button[aria-pressed]').filter({ hasNotText: "Bất kỳ nhân viên nào" }).first().click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(page).toHaveURL(/\/booking\/schedule$/);
  await page.getByRole("button", { name: targetDay, exact: true }).click();
  await expect(radiogroup.locator("button:not([disabled])").first()).toBeVisible({ timeout: 5000 });
  const remainingLabels = await radiogroup.locator("button:not([disabled])").allTextContents();
  expect(remainingLabels.map((l) => l.trim())).not.toContain(slotLabel);

  // Cancel the appointment, then confirm the slot is offered again (it's still in the future).
  const cancel = await request.patch(`${BACKEND_URL}/appointments/guest/cancel`, {
    data: { code: appointmentCode, phone },
  });
  expect(cancel.ok()).toBeTruthy();

  // Booking wizard state lives in a client-side React context that resets on a full page
  // navigation, so re-check availability by redoing the same 3-step flow rather than jumping
  // straight to /booking/schedule (which would bounce back to /booking/services with no
  // service/staff selected).
  await page.goto(`${FRONTEND_URL}/booking/services`);
  await page.locator("button", { hasText: "Manicure Cơ Bản" }).first().click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(page).toHaveURL(/\/booking\/staff$/);
  await page.locator('button[aria-pressed]').filter({ hasNotText: "Bất kỳ nhân viên nào" }).first().click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(page).toHaveURL(/\/booking\/schedule$/);
  await page.getByRole("button", { name: targetDay, exact: true }).click();
  await expect(radiogroup.locator("button:not([disabled])").first()).toBeVisible({ timeout: 5000 });
  const labelsAfterCancel = await radiogroup.locator("button:not([disabled])").allTextContents();
  expect(labelsAfterCancel.map((l) => l.trim())).toContain(slotLabel);
});
