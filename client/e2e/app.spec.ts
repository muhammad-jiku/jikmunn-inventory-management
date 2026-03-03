import { expect, Page, test } from '@playwright/test';

const API_BASE = 'http://localhost:8000';

/** Mock product data returned by intercepted API calls. */
const MOCK_PRODUCTS = {
  data: [
    {
      productId: 'prod-1',
      name: 'Test Widget',
      price: 29.99,
      rating: 4.5,
      stockQuantity: 100,
      stockThreshold: 10,
    },
    {
      productId: 'prod-2',
      name: 'Test Gadget',
      price: 49.99,
      rating: 3.8,
      stockQuantity: 42,
      stockThreshold: 5,
    },
  ],
  pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
};

/**
 * Intercept all API requests to localhost:8000 and return sensible
 * mock responses so tests don't depend on a running backend.
 */
async function mockApi(page: Page) {
  await page.route(`${API_BASE}/**`, (route) => {
    const url = route.request().url();

    if (url.includes('/products')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PRODUCTS),
      });
    }

    if (url.includes('/dashboard')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    }

    // Default: empty 200
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

/**
 * Inject a fake auth state into localStorage so redux-persist
 * rehydrates the store as "authenticated" and the AuthGuard
 * does not redirect to /login.
 *
 * We must navigate first to establish the origin, then set storage,
 * then reload so the app picks up the persisted state.
 */
async function seedAuth(page: Page, url = '/') {
  // Set up API mocks before any navigation
  await mockApi(page);

  // 1. Go to the target URL to establish the origin
  await page.goto(url, { waitUntil: 'commit' });

  // 2. Inject auth state into localStorage
  await page.evaluate(() => {
    const authState = {
      user: {
        userId: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      },
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token',
      isAuthenticated: true,
    };

    const persistRoot = {
      global: JSON.stringify({ isSidebarCollapsed: false, isDarkMode: false }),
      auth: JSON.stringify(authState),
      _persist: JSON.stringify({ version: -1, rehydrated: true }),
    };

    localStorage.setItem('persist:root', JSON.stringify(persistRoot));
  });

  // 3. Reload so redux-persist rehydrates from the seeded localStorage
  await page.reload({ waitUntil: 'networkidle' });
}

test.describe('Dashboard Page', () => {
  test('should load the dashboard page', async ({ page }) => {
    await seedAuth(page, '/');
    await expect(page).toHaveTitle(/Inventory/i);
  });

  test('should display the sidebar navigation', async ({ page }) => {
    await seedAuth(page, '/');
    await expect(page.getByText('jikmunn STOCK')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await seedAuth(page, '/');
    await page.locator('a[href="/products"]').click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('should navigate to inventory page', async ({ page }) => {
    await seedAuth(page, '/');
    await page.locator('a[href="/inventory"]').click();
    await expect(page).toHaveURL(/\/inventory/);
  });

  test('should toggle dark mode', async ({ page }) => {
    await seedAuth(page, '/');
    const html = page.locator('html');

    // Initially light mode
    await expect(html).toHaveClass(/light/, { timeout: 10000 });

    // Wait for hydration to complete — the button is re-rendered during hydration
    await page.waitForLoadState('networkidle');

    // The dark-mode toggle renders a Moon (light→dark) or Sun (dark→light) icon.
    const darkModeButton = page.locator(
      'button:has(svg.lucide-moon), button:has(svg.lucide-sun)'
    );
    await expect(darkModeButton.first()).toBeVisible({ timeout: 10000 });
    await darkModeButton.first().click({ force: true });

    // Should switch to dark mode
    await expect(html).toHaveClass(/dark/);
  });
});

test.describe('Products Page', () => {
  test('should load products page', async ({ page }) => {
    await seedAuth(page, '/products');
    await expect(
      page.getByRole('heading', { name: 'Products' }).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('should have a search input', async ({ page }) => {
    await seedAuth(page, '/products');
    await expect(page.getByPlaceholder('Search products...')).toBeVisible({
      timeout: 15000,
    });
  });

  test('should have a create product button', async ({ page }) => {
    await seedAuth(page, '/products');
    await expect(
      page.getByRole('button', { name: /Create\s+Product/i })
    ).toBeVisible({ timeout: 15000 });
  });

  test('should open create product modal', async ({ page }) => {
    await seedAuth(page, '/products');
    await page
      .getByRole('button', { name: /Create\s+Product/i })
      .click({ timeout: 15000 });
    await expect(
      page.getByRole('heading', { name: 'Create New Product' })
    ).toBeVisible();
  });
});
