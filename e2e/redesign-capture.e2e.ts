import { test } from '@playwright/test';
import { installSyntheticSupabase } from './fixtures/syntheticSupabase';

test('capture redesigned product areas', async ({ page }) => {
  await installSyntheticSupabase(page, 'org_admin');
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [name, path] of [
    ['dashboard', '/org/admin/dashboard'],
    ['workspace', '/work/workspace'],
    ['communication', '/communication/conversations'],
    ['finance', '/finance/cockpit'],
    ['tasks', '/work/tasks'],
  ] as const) {
    await page.goto(path);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `artifacts/redesign/${name}.png`, fullPage: true });
  }
});
