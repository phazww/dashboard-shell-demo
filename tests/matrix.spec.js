import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// 6 routes x 3 browsers (playwright projects) x 6 widths = 108 combinations
const routes = [
  { path: '/dashboard', h1: 'Главная', crumbs: ['Главная'] },
  { path: '/dashboard/overview', h1: 'Обзор', crumbs: ['Главная', 'Обзор'] },
  { path: '/dashboard/profile', h1: 'Профиль', crumbs: ['Главная', 'Профиль'] },
  {
    path: '/dashboard/profile/professional',
    h1: 'Профессиональные данные',
    crumbs: ['Главная', 'Профиль', 'Профессиональные данные'],
  },
  { path: '/dashboard/work-contexts', h1: 'Рабочие контексты', crumbs: ['Главная', 'Рабочие контексты'] },
  { path: '/dashboard/settings', h1: 'Настройки', crumbs: ['Главная', 'Настройки'] },
];

const widths = [320, 375, 768, 991, 992, 1440]; // 991/992 = Bootstrap lg breakpoint, both sides
const LG = 992;

for (const route of routes) {
  for (const width of widths) {
    test(`${route.path} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(route.path);

      await expect(page.getByRole('heading', { level: 1, name: route.h1 })).toBeVisible();
      await expect(page).toHaveTitle(new RegExp(route.h1));
      await expect(page.locator('#breadcrumbs li')).toHaveText(route.crumbs);
      await expect(page.locator('#breadcrumbs [aria-current="page"]')).toHaveText(route.crumbs.at(-1));
      await expect(page.locator('#main-nav [aria-current="page"]')).toHaveText(route.h1);
      await expect(page.locator('[data-testid="topbar"]')).toBeVisible();
      await expect(page.locator('#context-toggle')).toBeVisible();

      if (width >= LG) {
        await expect(page.locator('#sidebar')).toBeVisible();
        await expect(page.locator('#menu-toggle')).toBeHidden();
      } else {
        await expect(page.locator('#sidebar')).toBeHidden();
        await expect(page.locator('#menu-toggle')).toBeVisible();
      }

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, 'horizontal page scroll').toBeLessThanOrEqual(0);

      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }
}
