import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { installSyntheticSupabase } from './fixtures/syntheticSupabase';

test.setTimeout(120_000);

const reviewRoutes = [
  ['command-center', '/org/admin/dashboard'], ['my-work', '/work/my-work'],
  ['project-workspace', '/work/workspace'], ['communication', '/communication/conversations'],
  ['people', '/people/employees'], ['time', '/time/tracking'], ['files', '/knowledge/files'],
  ['finance', '/finance/cockpit'], ['reports', '/analytics/reports'], ['ai', '/ai/copilots'],
] as const;

test('all customer review routes use one V8 operating frame in dark and authored light', async ({ page }) => {
  const assertSafe = await installSyntheticSupabase(page, 'org_admin');
  await page.setViewportSize({ width: 1440, height: 1000 });
  mkdirSync('/tmp/workos-v8-cutover/final', { recursive: true });

  for (const [name, path] of reviewRoutes) {
    await page.goto(path);
    await expect(page.locator('.v8-canvas')).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Context tools' })).toBeVisible();
    await expect(page.locator('.app-shell')).toHaveCount(0);
    await page.screenshot({ path: `/tmp/workos-v8-cutover/final/${name}-dark.png`, fullPage: true });
  }

  for (const [name, path] of reviewRoutes.slice(0, 4)) {
    await page.goto(path);
    if (await page.getByRole('button', { name: 'Use light appearance' }).isVisible()) {
      await page.getByRole('button', { name: 'Use light appearance' }).click();
    }
    await expect(page.locator('html')).toHaveAttribute('data-workos-theme', 'light');
    await page.screenshot({ path: `/tmp/workos-v8-cutover/final/${name}-light.png`, fullPage: true });
  }
  await assertSafe();
});

test('employee customer routes also use the V8 frame without privileged destinations', async ({ page }) => {
  const assertSafe = await installSyntheticSupabase(page, 'employee');
  await page.goto('/work/my-work');
  await expect(page.locator('.v8-canvas')).toBeVisible();
  const productNavigation = page.getByRole('navigation', { name: 'Product navigation' });
  await expect(productNavigation.getByRole('button', { name: 'My Work' })).toBeVisible();
  await expect(productNavigation.getByRole('button', { name: 'Finance' })).toHaveCount(0);
  await expect(productNavigation.getByRole('button', { name: 'People' })).toHaveCount(0);
  await assertSafe();
});
