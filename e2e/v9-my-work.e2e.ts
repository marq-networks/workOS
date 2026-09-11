import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { installSyntheticSupabase } from './fixtures/syntheticSupabase';

test.beforeEach(async ({ page }) => {
  await installSyntheticSupabase(page, 'employee');
  await page.goto('/work/my-work');
  await expect(page.locator('.v9-work')).toBeVisible();
});

test('keeps task execution and repository-backed chunks in context', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole('region', { name: 'My Work execution field' })).toBeVisible();
  await page.getByRole('button', { name: /Finalize onboarding handoff/ }).click();
  const inspector = page.getByRole('complementary', { name: 'Task execution inspector' });
  await expect(inspector).toBeVisible();
  await expect(inspector.getByText('Confirm final interaction notes')).toBeVisible();
  await expect(inspector.getByText('4/4')).toHaveCount(0);
  const accessibility = await new AxeBuilder({ page }).include('.v9-work').analyze();
  expect(accessibility.violations.filter(result => ['critical', 'serious'].includes(result.impact ?? ''))).toEqual([]);
  await page.screenshot({ path: '/tmp/workos-v9-review/my-work/my-work-inspector-dark.png', fullPage: true });
});

test('captures authored dark, light, and responsive execution fields', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: '/tmp/workos-v9-review/my-work/my-work-dark-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Use light appearance' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-workos-theme', 'light');
  await page.screenshot({ path: '/tmp/workos-v9-review/my-work/my-work-light-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: /Turn outcomes into/ })).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/workos-v9-review/my-work/my-work-mobile-light.png', fullPage: true });
});
