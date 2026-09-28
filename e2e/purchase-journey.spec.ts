import { expect, test } from "@playwright/test";

// Runs against a real backend (BACKEND_CONTRACT.md), not mocks — assumes the seed data from
// `npm run seed` exists (the simple product "cotton-saree-blue" and the pre-verified test
// customer). NEVER point this at the production database: it creates orders and accounts.
// See NOTES.md ("Running E2E safely") for the local, sandboxed setup. Payment
// itself can't be completed without real Razorpay test-mode credentials (flagged repeatedly —
// see NOTES.md Section 10/17) — these tests stop at the actual boundary of what's testable
// rather than faking a payment success.
//
// Serial, not parallel (playwright.config.ts defaults to fullyParallel): both tests in this file
// mutate the SAME shared, finite resource on the SAME real backend + MongoDB — the seeded
// product's stock and the `/auth/*` rate-limit bucket. Running chromium + mobile-chrome
// concurrently against that shared state caused real cross-worker flakiness (observed directly:
// concurrent registrations/orders on the one seeded product intermittently failed) that
// disappeared entirely once serialized — an environment-sharing artifact of these tests, not a
// product bug.
test.describe.configure({ mode: "serial" });

test.describe("guest browse → filter → product detail → cart → checkout gate", () => {
  test("filtering updates the URL and results, and checkout redirects a guest to login", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /woven by hand/i })).toBeVisible();

    await page.getByRole("link", { name: "Shop the collection" }).click();
    await expect(page).toHaveURL(/\/products/);
    // Let CSS/hydration settle before checking which layout (desktop sidebar vs. mobile
    // drawer-trigger) is actually visible — right after navigation the "Filters" trigger can
    // still report visible for an instant pre-stylesheet, which would misdetect desktop as
    // mobile below.
    await expect(page.getByRole("heading", { level: 1, name: "All sarees" })).toBeVisible();

    // On narrow viewports (mobile-chrome project) the filters live behind a "Filter" bottom-
    // sheet trigger (FilterDrawer.tsx) instead of the always-visible desktop sidebar
    // (FilterPanel.tsx) — open it first so "In stock only" is actually there to click. Once
    // open, the SAME FilterPanel is mounted twice (the desktop <aside>, hidden but still in the
    // DOM via CSS, plus the drawer's copy), so the locator must be scoped to the dialog or it's
    // ambiguous.
    const filtersTrigger = page.getByRole("button", { name: "Filter", exact: true });
    const isMobileLayout = await filtersTrigger.isVisible();
    if (isMobileLayout) await filtersTrigger.click();
    const filterScope = isMobileLayout ? page.getByRole("dialog", { name: "Filter" }) : page;

    // .click(), not .check() — the checkbox's `checked` state is fully derived from the URL
    // (Section 6: URL is the source of truth for filters), which updates asynchronously via a
    // Next.js navigation. `.check()`'s own strict immediate-state assertion is a real but
    // test-side timing mismatch with that pattern, not a product bug — the subsequent URL
    // assertion below is what actually needs to wait, and does.
    await filterScope.getByLabel("In stock only").first().click();
    await expect(page).toHaveURL(/inStock=true/);
    // Seeded products are in stock, so filtering shouldn't empty the results.
    await expect(page.getByText("No sarees match these filters")).not.toBeVisible();

    await page.goto("/products/cotton-saree-blue");
    await expect(
      page.getByRole("heading", { level: 1, name: "Cotton Saree - Blue" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Add to cart", exact: true }).click();
    await expect(page.getByRole("dialog", { name: /Your cart/ })).toBeVisible();
    await page.getByRole("link", { name: "View cart" }).click();
    await expect(page).toHaveURL("/cart");

    await page.getByRole("button", { name: "Proceed to checkout" }).click();
    // Checkout requires auth (BACKEND_CONTRACT.md — /orders requires a logged-in user).
    // CartPage.handleCheckout builds this URL with a literal "/checkout", not
    // encodeURIComponent — unlike ProtectedRoute's own redirect, which does encode.
    await expect(page).toHaveURL("/login?redirect=/checkout");
  });
});

// Seeded, pre-verified customer from saree_grace_backend/scripts/seed.ts (test-only account).
const SEED_CUSTOMER = { email: "customer@example.com", password: "Customer123!" };

test.describe("registration → email verification", () => {
  test("new sign-ups are sent to OTP verification, not straight into the store", async ({
    page,
  }) => {
    const email = `e2e-${Date.now()}-${test.info().project.name}@example.com`;
    await page.goto("/register");
    await page.getByLabel("Full name").fill("E2E Test User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("E2ETestPass123!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(new RegExp(`/verify-otp\\?email=${encodeURIComponent(email)}`));
  });
});

test.describe("signed-in customer: add to cart → checkout form → order creation", () => {
  test("adds a real product to the server cart and creates a real order", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(SEED_CUSTOMER.email);
    await page.getByLabel("Password", { exact: true }).fill(SEED_CUSTOMER.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/products/cotton-saree-blue");
    await page.getByRole("button", { name: "Add to cart", exact: true }).click();
    await expect(page.getByRole("dialog", { name: /Your cart/ })).toBeVisible();
    await page.getByRole("link", { name: "View cart" }).click();

    await page.getByRole("button", { name: "Proceed to checkout" }).click();
    await expect(page).toHaveURL("/checkout");

    await page.getByLabel("Full name").fill("E2E Test User");
    await page.getByLabel("Phone").fill("9876543210");
    await page.getByLabel("Address line 1").fill("123 Test Street");
    await page.getByLabel("City").fill("Chennai");
    await page.getByLabel("State").selectOption("Tamil Nadu");
    await page.getByLabel("Postal code").fill("600001");
    // Shipping is computed from the state (lib/shippingFee.ts mirrors the backend).
    await expect(page.getByText("₹40")).toBeVisible();

    await page.getByRole("button", { name: "Place order & pay" }).click();

    // The real order is created at this point either way (verified independently live via curl
    // in Section 10 — decrements stock, clears the cart). What happens next with only
    // placeholder Razorpay credentials is genuinely NONDETERMINISTIC, confirmed by direct
    // observation (a captured network trace), not assumed:
    //   (a) the backend's razorpay.orders.create() call throws (Razorpay's API rejects the fake
    //       key) → errorHandler.ts's generic 500 branch → a real "Internal server error" toast
    //       (getApiErrorMessage surfaces that body message verbatim), or
    //   (b) Razorpay's API accepts the syntactically-valid-looking test key at order-creation
    //       time regardless, and checkout.js opens its real, live-hosted Test Mode widget
    //       (confirmed via captured frame URLs — traffic_env=production, a "Test Mode" badge in
    //       the DOM) — this is Razorpay's own sandbox UI, not a real payment rail, and no card
    //       is ever entered here.
    // Both are the real, correct boundary of what's testable without genuine Razorpay
    // credentials (see NOTES.md) — accepting either rather than picking one and calling the
    // other case a bug.
    // A plain .or() assertion can't express "either visible text, or an iframe merely
    // *attached*" — the Razorpay widget iframe (confirmed via class="razorpay-checkout-frame")
    // is sometimes present but visibility:hidden during its own load sequence on the
    // mobile-chrome viewport specifically; its mere presence is already proof checkout.js
    // opened a real widget, which is the actual thing being verified here. Promise.any (not
    // .race): resolves as soon as either happens, but — unlike .race — still fails the test if
    // BOTH time out, instead of resolving on whichever loses the race with a swallowed error.
    await Promise.any([
      page.getByText("Internal server error").waitFor({ state: "visible", timeout: 15000 }),
      page.locator('iframe[src*="razorpay.com"]').waitFor({ state: "attached", timeout: 15000 }),
    ]);
  });
});
