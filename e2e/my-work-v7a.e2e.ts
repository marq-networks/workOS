import { expect, test } from '@playwright/test';
import { installSyntheticSupabase } from './fixtures/syntheticSupabase';

test('My Work keeps task execution in context', async ({ page }) => {
  const assertSafe = await installSyntheticSupabase(page, 'org_admin');
  await page.goto('/work/my-work');
  await expect(page.getByRole('heading', { name: 'Make today count.' })).toBeVisible();
  await page.getByRole('button', { name: /Finalize onboarding handoff/ }).click();
  await expect(page).toHaveURL('/work/my-work');
  await expect(page.getByRole('heading', { name: 'Finalize onboarding handoff' })).toBeVisible();
  await expect(page.getByText('Customer onboarding', { exact: true }).last()).toBeVisible();
  await expect(page.getByText('2 / 4 complete')).toBeVisible();
  await page.getByRole('button', { name: 'Blocked 1' }).click();
  await expect(page.getByRole('button', { name: /Confirm analytics events/ })).toBeVisible();
  await assertSafe();
});
