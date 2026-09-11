import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { installSyntheticSupabase } from './fixtures/syntheticSupabase';

test('Org Admin product navigation opens the V7A My Work cockpit and preserves Tasks', async ({ page }) => {
  const assertSafe = await installSyntheticSupabase(page, 'org_admin');
  await page.goto('/org/admin/dashboard');

  await page.getByRole('navigation', { name: 'Product navigation' }).getByRole('button', { name: 'My Work' }).click();

  await expect(page).toHaveURL('/work/my-work');
  await expect(page.getByRole('heading', { name: 'Make today count.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).not.toBeVisible();
  mkdirSync('/tmp/workos-v7a-routing/final', { recursive: true });
  await page.screenshot({ path: '/tmp/workos-v7a-routing/final/my-work.png', fullPage: true });

  await page.goto('/work/tasks');
  await expect(page).toHaveURL('/work/tasks');
  await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Make today count.' })).not.toBeVisible();
  await assertSafe();
});

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
