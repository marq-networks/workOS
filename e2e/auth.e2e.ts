import { expect, test } from '@playwright/test';
import { assertStorageSignedOut, installSyntheticSupabase } from './fixtures/syntheticSupabase';

test('signed-out deep links canonicalize to login and stay protected through Back', async ({ page }) => {
  const assertSafe = await installSyntheticSupabase(page, 'signed_out');
  await page.goto('/people/members');
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { name: 'Sign in to Work OS' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Memberships & Invitations' })).not.toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { name: 'Memberships & Invitations' })).not.toBeVisible();
  await assertSafe();
});

test('invalid login exposes only the generic safe error', async ({ page }) => {
  const assertSafe = await installSyntheticSupabase(page, 'signed_out');
  await page.goto('/login');
  await page.getByLabel('Email').fill('invalid@example.invalid');
  await page.getByLabel('Password').fill('not-a-real-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Unable to sign in with those credentials. Check your details and try again.');
  await expect(page.getByText('Synthetic provider detail')).not.toBeVisible();
  await expect(page).toHaveURL('/login');
  await assertStorageSignedOut(page.context());
  await assertSafe();
});

test('logout through the visible profile menu prevents authenticated Back restoration', async ({ page }) => {
  const assertSafe = await installSyntheticSupabase(page, 'employee');
  await page.goto('/work/my-work');
  await expect(page.getByRole('heading', { name: 'My Work' })).toBeVisible();
  await page.getByRole('button', { name: /Synthetic employee/ }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await expect(page).toHaveURL('/login');
  await assertStorageSignedOut(page.context());
  await page.goBack();
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { name: 'My Work' })).not.toBeVisible();
  await assertSafe();
});

test('an authenticated identity without memberships can sign out safely', async ({ page }) => {
  const assertSafe = await installSyntheticSupabase(page, 'no_organization');
  await page.goto('/work/my-work');
  await expect(page.getByRole('heading', { name: 'No organization access' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL('/login');
  await page.goto('/work/my-work');
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { name: 'My Work' })).not.toBeVisible();
  await assertSafe();
});
