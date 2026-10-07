import { test, expect } from '@playwright/test';

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

// Safari/WebKit on macOS skips links and buttons with a plain Tab (system setting), Option+Tab is the real "tab through everything" key there.
const tabKey = (browserName, shift = false) => {
  const alt = browserName === 'webkit' && process.platform === 'darwin';
  return `${alt ? 'Alt+' : ''}${shift ? 'Shift+' : ''}Tab`;
};

const focusInside = (page, selector) =>
  page.evaluate((sel) => document.querySelector(sel)?.contains(document.activeElement) ?? false, selector);

async function openMenu(page) {
  await page.locator('#menu-toggle').click();
  await expect(page.locator('#sidebar')).toHaveClass(/show(?!ing)/);
  await expect(page.locator('.offcanvas-backdrop.show')).toBeVisible();
}

async function expectClosed(page) {
  await expect(page.locator('#sidebar')).not.toHaveClass(/show/);
  await expect(page.locator('#sidebar')).toBeHidden();
  await expect(page.locator('.offcanvas-backdrop')).toHaveCount(0);
}

test.describe('mobile Offcanvas', () => {
  test.use({ viewport: MOBILE });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('menu is hidden until opened, toggle opens a modal dialog with focus inside', async ({ page }) => {
    await expect(page.locator('#sidebar')).toBeHidden();
    await openMenu(page);
    await expect(page.locator('#sidebar')).toHaveAttribute('role', 'dialog');
    await expect(page.locator('#sidebar')).toHaveAttribute('aria-modal', 'true');
    await expect(page.getByRole('dialog', { name: 'Меню' })).toBeVisible();
    expect(await focusInside(page, '#sidebar')).toBe(true);
  });

  test('Esc closes the menu and returns focus to the toggle button', async ({ page }) => {
    await openMenu(page);
    await page.keyboard.press('Escape');
    await expectClosed(page);
    await expect(page.locator('#menu-toggle')).toBeFocused();
  });

  test('click on the backdrop closes the menu and returns focus to the toggle button', async ({ page }) => {
    await openMenu(page);
    // the panel takes at most 85vw (~331px), the rest of the screen is the backdrop
    await page.mouse.click(MOBILE.width - 10, MOBILE.height / 2);
    await expectClosed(page);
    await expect(page.locator('#menu-toggle')).toBeFocused();
  });

  test('close button closes the menu and returns focus to the toggle button', async ({ page }) => {
    await openMenu(page);
    await page.getByRole('button', { name: 'Закрыть меню' }).click();
    await expectClosed(page);
    await expect(page.locator('#menu-toggle')).toBeFocused();
  });

  test('keyboard only: Enter on the toggle opens, Esc closes, focus is back on the toggle', async ({ page }) => {
    await page.locator('#menu-toggle').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#sidebar')).toHaveClass(/show(?!ing)/);
    await page.keyboard.press('Escape');
    await expectClosed(page);
    await expect(page.locator('#menu-toggle')).toBeFocused();
  });

  test('focus is trapped inside the open menu (Tab and Shift+Tab)', async ({ page, browserName }) => {
    await openMenu(page);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press(tabKey(browserName));
      expect(await focusInside(page, '#sidebar'), `Tab #${i + 1}`).toBe(true);
    }
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press(tabKey(browserName, true));
      expect(await focusInside(page, '#sidebar'), `Shift+Tab #${i + 1}`).toBe(true);
    }
  });

  test('page behind the backdrop cannot be clicked while the menu is open', async ({ page }) => {
    await openMenu(page);
    await page.mouse.click(MOBILE.width - 10, 200); // would hit the content area without the backdrop
    await expectClosed(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('navigation: menu closes, URL, title, aria-current and breadcrumbs update, focus goes to the page heading', async ({ page }) => {
    await openMenu(page);
    await page.locator('#sidebar').getByRole('link', { name: 'Обзор' }).click();
    await expectClosed(page);
    await expect(page).toHaveURL(/\/dashboard\/overview$/);
    await expect(page).toHaveTitle(/Обзор/);
    await expect(page.getByRole('heading', { level: 1, name: 'Обзор' })).toBeFocused();
    await expect(page.locator('#main-nav [aria-current="page"]')).toHaveText('Обзор');
    await expect(page.locator('#breadcrumbs [aria-current="page"]')).toHaveText('Обзор');
  });

  test('navigation to a nested route keeps the parent in the breadcrumbs', async ({ page }) => {
    await openMenu(page);
    await page.locator('#sidebar').getByRole('link', { name: 'Профессиональные данные' }).click();
    await expectClosed(page);
    await expect(page).toHaveURL(/\/dashboard\/profile\/professional$/);
    const crumbs = page.locator('#breadcrumbs li');
    await expect(crumbs).toHaveText(['Главная', 'Профиль', 'Профессиональные данные']);
  });

  test('menu can be opened again after navigation and still works with Esc', async ({ page }) => {
    await openMenu(page);
    await page.locator('#sidebar').getByRole('link', { name: 'Настройки' }).click();
    await expectClosed(page);
    await openMenu(page);
    await page.keyboard.press('Escape');
    await expectClosed(page);
    await expect(page.locator('#menu-toggle')).toBeFocused();
  });

  test('browser Back after navigation returns to the previous page without opening the menu', async ({ page }) => {
    await openMenu(page);
    await page.locator('#sidebar').getByRole('link', { name: 'Профиль' }).first().click();
    await expectClosed(page);
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Главная' })).toBeVisible();
    await expect(page.locator('#sidebar')).toBeHidden();
  });

  test('widening the window to desktop while the menu is open closes the overlay', async ({ page }) => {
    await openMenu(page);
    await page.setViewportSize(DESKTOP);
    await expect(page.locator('.offcanvas-backdrop')).toHaveCount(0);
    await expect(page.locator('#sidebar')).toBeVisible();
    await expect(page.locator('#menu-toggle')).toBeHidden();
  });
});

test.describe('desktop sidebar', () => {
  test.use({ viewport: DESKTOP });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('sidebar is always visible, no toggle button, no backdrop', async ({ page }) => {
    await expect(page.locator('#sidebar')).toBeVisible();
    await expect(page.locator('#menu-toggle')).toBeHidden();
    await expect(page.locator('.offcanvas-backdrop')).toHaveCount(0);
    await expect(page.locator('#sidebar')).not.toHaveAttribute('aria-modal', 'true');
  });

  test('navigation works and focus goes to the page heading', async ({ page }) => {
    await page.locator('#sidebar').getByRole('link', { name: 'Рабочие контексты' }).click();
    await expect(page).toHaveURL(/\/dashboard\/work-contexts$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Рабочие контексты' })).toBeFocused();
    await expect(page.locator('#sidebar')).toBeVisible();
  });

  test('Esc does nothing to the sidebar on desktop', async ({ page }) => {
    await page.locator('#sidebar').getByRole('link', { name: 'Обзор' }).focus();
    await page.keyboard.press('Escape');
    await expect(page.locator('#sidebar')).toBeVisible();
  });

  test('skip link moves focus to the main content', async ({ page, browserName }) => {
    await page.keyboard.press(tabKey(browserName));
    await expect(page.getByRole('link', { name: 'Перейти к содержимому' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });
});

test.describe('work context switcher', () => {
  test.use({ viewport: DESKTOP });

  test('switching the context updates the topbar, overview numbers and the context list', async ({ page }) => {
    await page.goto('/dashboard/overview');
    await expect(page.locator('#context-label')).toHaveText('Студия Альфа');
    await expect(page.locator('[data-stat="projects"]')).toHaveText('12');

    await page.locator('#context-toggle').click();
    await page.getByRole('button', { name: 'Школа Бета' }).click();

    await expect(page.locator('#context-label')).toHaveText('Школа Бета');
    await expect(page.locator('[data-stat="projects"]')).toHaveText('4');
    await expect(page.locator('#live')).toHaveText('Рабочий контекст: Школа Бета');

    await page.locator('#sidebar').getByRole('link', { name: 'Рабочие контексты' }).click();
    await expect(page.locator('li', { hasText: 'Школа Бета' }).getByText('Активен')).toBeVisible();
  });

  test('Esc closes the context dropdown and returns focus to its button', async ({ page }) => {
    await page.goto('/dashboard');
    await page.locator('#context-toggle').click();
    await expect(page.locator('#context-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#context-menu')).toBeHidden();
    await expect(page.locator('#context-toggle')).toBeFocused();
  });
});

test('unknown route shows a 404 page inside the shell', async ({ page }) => {
  await page.goto('/dashboard/nope');
  await expect(page.getByRole('heading', { level: 1, name: 'Страница не найдена' })).toBeVisible();
});

test('root redirects to /dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/dashboard$/);
});
