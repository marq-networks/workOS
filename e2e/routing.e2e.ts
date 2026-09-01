import { expect, test, type Page } from '@playwright/test';
import { installSyntheticSupabase, type SyntheticIdentity } from './fixtures/syntheticSupabase';

async function openAs(page: Page, identity: SyntheticIdentity, path: string) {
  const assertSafe = await installSyntheticSupabase(page, identity);
  await page.goto(path);
  return assertSafe;
}

test('Employee session restores to its canonical permitted surface', async ({ page }) => {
  const assertSafe = await openAs(page, 'employee', '/');
  await expect(page).toHaveURL('/work/my-work');
  await expect(page.getByRole('heading', { name: 'My Work' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'My Work' })).toBeVisible();
  await assertSafe();
});

for (const path of ['/people/members', '/diagnostics/ui-binding']) {
  test(`Employee cannot render contained route ${path}`, async ({ page }) => {
    const assertSafe = await openAs(page, 'employee', '/work/my-work');
    await expect(page.getByRole('heading', { name: 'My Work' })).toBeVisible();
    await page.goto(path);
    await expect(page).toHaveURL('/work/my-work');
    await expect(page.getByRole('heading', { name: 'My Work' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Memberships & Invitations' })).not.toBeVisible();
    await expect(page.getByText(/UI Binding/i)).not.toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL('/work/my-work');
    await assertSafe();
  });
}

test('Org Admin restores to its default and may open Memberships', async ({ page }) => {
  const assertSafe = await openAs(page, 'org_admin', '/');
  await expect(page).toHaveURL('/org/admin/dashboard');
  await page.goto('/people/members');
  await expect(page).toHaveURL('/people/members');
  await expect(page.getByRole('heading', { name: 'Memberships & Invitations' })).toBeVisible();
  await page.goto('/diagnostics/ui-binding');
  await expect(page).toHaveURL('/org/admin/dashboard');
  await expect(page.getByText(/UI Binding/i)).not.toBeVisible();
  await assertSafe();
});

test('Platform Admin restores to the console and contains analysis routes', async ({ page }) => {
  const assertSafe = await openAs(page, 'platform_admin', '/');
  await expect(page).toHaveURL('/super/console');
  await expect(page.getByRole('heading', { name: /Console/ })).toBeVisible();
  await page.goto('/analysis/module-progress');
  await expect(page).toHaveURL('/super/console');
  await expect(page.getByText(/Module Progress/i)).not.toBeVisible();
  await assertSafe();
});
