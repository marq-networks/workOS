import { expect, test } from '@playwright/test';
import { installSyntheticSupabase } from './fixtures/syntheticSupabase';

test.beforeEach(async ({ page }) => {
  await installSyntheticSupabase(page, 'org_admin');
  await page.goto('/org/admin/dashboard');
  await expect(page.locator('.v9-home')).toBeVisible();
});

test('presents an operating picture and inspects work in context', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole('region', { name: 'Operating picture' })).toBeVisible();
  await expect(page.getByText('Confirm analytics events').first()).toBeVisible();
  await page.getByRole('button', { name: /Confirm analytics events/ }).first().click();
  const inspector = page.getByRole('complementary', { name: 'Work inspector' });
  await expect(inspector).toBeVisible();
  await expect(inspector.getByText('Waiting on the event taxonomy decision from product.')).toBeVisible();
  await page.screenshot({ path: '/tmp/workos-v9-review/home/home-inspector-dark.png', fullPage: true });
});

test('captures authored dark, light, and responsive states', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: '/tmp/workos-v9-review/home/home-dark-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Use light appearance' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-workos-theme', 'light');
  await page.screenshot({ path: '/tmp/workos-v9-review/home/home-light-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/tmp/workos-v9-review/home/home-mobile-light.png', fullPage: true });
});
