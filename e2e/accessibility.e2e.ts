import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { installSyntheticSupabase, type SyntheticIdentity } from './fixtures/syntheticSupabase';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const surfaces: Array<{ identity: SyntheticIdentity; path: string; heading: RegExp | string }> = [
  { identity: 'signed_out', path: '/login', heading: 'Sign in to Work OS' },
  { identity: 'employee', path: '/work/my-work', heading: 'My Work' },
  { identity: 'org_admin', path: '/org/admin/dashboard', heading: /Dashboard/ },
  { identity: 'org_admin', path: '/people/members', heading: 'Memberships & Invitations' },
  { identity: 'platform_admin', path: '/super/console', heading: /Console/ },
];

async function scan(page: Page) {
  return new AxeBuilder({ page }).withTags(wcagTags).analyze();
}

for (const surface of surfaces) {
  test(`${surface.identity} ${surface.path} has no critical or serious accessibility violations`, async ({ page }) => {
    const assertSafe = await installSyntheticSupabase(page, surface.identity);
    await page.goto(surface.path);
    await expect(page.getByRole('heading', { name: surface.heading }).first()).toBeVisible();
    const results = await scan(page);
    const blocking = results.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious');
    const nonBlocking = results.violations.filter(({ impact }) => impact === 'moderate' || impact === 'minor');
    test.info().annotations.push({
      type: 'accessibility-baseline',
      description: `moderate=${nonBlocking.filter(({ impact }) => impact === 'moderate').length}; minor=${nonBlocking.filter(({ impact }) => impact === 'minor').length}`,
    });
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
    await assertSafe();
  });
}

test('login controls and the authenticated profile menu are keyboard reachable', async ({ page }) => {
  let assertSafe = await installSyntheticSupabase(page, 'signed_out');
  await page.goto('/login');
  await page.getByLabel('Email').focus();
  await expect(page.getByLabel('Email')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Password', { exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeFocused();
  await assertSafe();

  await page.close();
  page = await page.context().newPage();
  assertSafe = await installSyntheticSupabase(page, 'employee');
  await page.goto('/work/my-work');
  const profile = page.getByRole('button', { name: /Synthetic employee/ });
  await profile.focus();
  await expect(profile).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitem', { name: 'Log out' })).toBeVisible();
  await assertSafe();
});
