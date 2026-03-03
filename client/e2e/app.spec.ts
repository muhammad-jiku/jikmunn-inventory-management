import { expect, test } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('should load the dashboard page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Inventory/i);
  });

  test('should display the sidebar navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('jikmunn STOCK')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Products').click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('should navigate to inventory page', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Inventory').click();
    await expect(page).toHaveURL(/\/inventory/);
  });

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    // Initially light mode
    await expect(html).toHaveClass(/light/);

    // Find and click the dark mode toggle (Moon icon button)
    const darkModeButton = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .nth(2);
    await darkModeButton.click();

    // Should switch to dark mode
    await expect(html).toHaveClass(/dark/);
  });
});

test.describe('Products Page', () => {
  test('should load products page', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });

  test('should have a search input', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByPlaceholder('Search products...')).toBeVisible();
  });

  test('should have a create product button', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByText('Create Product')).toBeVisible();
  });

  test('should open create product modal', async ({ page }) => {
    await page.goto('/products');
    await page.getByText('Create Product').click();
    await expect(
      page.getByRole('heading', { name: 'Create New Product' })
    ).toBeVisible();
  });
});
