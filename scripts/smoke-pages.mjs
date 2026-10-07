// Smoke test for the static Pages build. Usage: node smoke-pages.mjs <origin+base>, e.g. http://localhost:4600/dashboard-shell-demo
import { chromium, webkit, expect } from '@playwright/test';

const root = process.argv[2];
const routes = ['/dashboard', '/dashboard/overview', '/dashboard/profile', '/dashboard/profile/professional', '/dashboard/work-contexts', '/dashboard/settings'];
let failed = 0;
for (const type of [chromium, webkit]) {
  const browser = await type.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errors.push(m.text()));
  try {
    for (const r of routes) {
      await page.goto(root + r);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#main-nav [aria-current="page"]')).toHaveCount(1);
    }
    await page.goto(root + '/');
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto(root + '/dashboard/profile');
    await page.locator('#menu-toggle').click();
    await expect(page.locator('#sidebar')).toHaveClass(/show(?!ing)/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#sidebar')).toBeHidden();
    await expect(page.locator('#menu-toggle')).toBeFocused();
    await page.locator('#menu-toggle').click();
    await page.locator('#sidebar').getByRole('link', { name: 'Настройки' }).click();
    await expect(page.locator('#sidebar')).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`${root.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}/dashboard/settings$`));
    await expect(page.getByRole('heading', { level: 1, name: 'Настройки' })).toBeFocused();
    if (errors.length) throw new Error('console errors: ' + errors.join('; '));
    console.log(`${type.name()}: OK`);
  } catch (e) {
    failed++;
    console.log(`${type.name()}: FAIL\n${e.message}`);
  }
  await browser.close();
}
process.exit(failed ? 1 : 0);
