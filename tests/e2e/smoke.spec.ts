import { test, expect } from "@playwright/test";

// A unique 10-digit phone per run so the signup smoke doesn't collide.
function randomPhone() {
  return "9" + Math.floor(100000000 + Math.random() * 899999999).toString();
}

test("home page renders the hero and key sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Become the software engineer/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Start Journey/i }).first()).toBeVisible();
});

test("request callback modal submits successfully", async ({ page }) => {
  await page.goto("/");
  // Open the global Request Callback modal from the nav.
  await page.getByRole("button", { name: /Request Callback/i }).first().click();
  await expect(page.getByRole("heading", { name: /Request a Callback/i })).toBeVisible();
  await page.getByLabel("Name").fill("Smoke Tester");
  await page.getByLabel("Phone no.").fill("9876500099");
  await page.getByRole("button", { name: /Book My Callback/i }).click();
  await expect(page.getByText(/You're all set|all set/i)).toBeVisible();
});

test("signup with OTP then enroll in a free course", async ({ page }) => {
  const phone = randomPhone();

  // Sign up
  await page.goto("/auth/signup");
  await page.getByLabel("First name").fill("Smoke");
  await page.getByLabel("Last name").fill("User");
  await page.getByLabel("Phone number").fill(phone);
  await page.getByRole("button", { name: /Register Now/i }).click();

  // Dev-mode surfaces the OTP; click "Use code" to auto-fill + verify.
  await expect(page.getByText(/SMS not configured/i)).toBeVisible();
  await page.getByRole("button", { name: /Use code/i }).click();

  // Land in the classroom (or profile/classroom callback).
  await expect(page).toHaveURL(/\/classroom|\/profile/, { timeout: 20_000 });

  // Enroll in a course (free during launch → direct enroll → classroom).
  await page.goto("/courses/machine-learning-deep-learning");
  await expect(page.getByText("FREE").first()).toBeVisible();
  await page.getByRole("button", { name: /Start for free|Enroll now/i }).first().click();
  await expect(page).toHaveURL(/\/classroom/, { timeout: 20_000 });
});
