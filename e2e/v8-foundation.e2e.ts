import { expect, test } from '@playwright/test';
import { installSyntheticSupabase } from './fixtures/syntheticSupabase';

test.beforeEach(async ({ page }) => {
  await installSyntheticSupabase(page, 'org_admin');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/org/admin/dashboard');
  await expect(page.locator('.v8-canvas')).toBeVisible();
});

test('command and contextual surfaces preserve the workspace', async ({ page }) => {
  await page.keyboard.press('Control+k');
  const command = page.getByRole('dialog', { name: 'Global command and search' });
  await expect(command).toBeVisible();
  await command.getByPlaceholder('Search product destinations…').fill('people');
  await expect(command.getByRole('button', { name: /People/ })).toBeVisible();
  await page.screenshot({ path: 'artifacts/v8/foundation-command-dark.png', fullPage: true });
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Open notifications' }).click();
  await expect(page.getByRole('complementary', { name: 'Context panel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Organization operations' })).toBeVisible();
  await page.screenshot({ path: 'artifacts/v8/foundation-drawer-dark.png', fullPage: true });
});

test('light material theme is authored and responsive', async ({ page }) => {
  await page.getByRole('button', { name: 'Use light appearance' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-workos-theme', 'light');
  await page.screenshot({ path: 'artifacts/v8/foundation-light.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open product navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Product navigation' })).toHaveClass(/is-open/);
  await page.screenshot({ path: 'artifacts/v8/foundation-mobile-light.png', fullPage: true });
});
