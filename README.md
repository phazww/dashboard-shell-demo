# Dashboard Shell demo

Небольшое собственное demo: адаптивная оболочка dashboard на Bootstrap 5.3 без сборщика и без backend.

- desktop (от 992px): постоянный sidebar
- mobile (до 992px): Bootstrap Offcanvas, кнопка в topbar
- topbar с переключателем рабочего контекста (состояние только в памяти)
- breadcrumbs из route registry, `aria-current` в меню и крошках
- 6 маршрутов: `/dashboard`, `/dashboard/overview`, `/dashboard/profile`, `/dashboard/profile/professional`, `/dashboard/work-contexts`, `/dashboard/settings`

## Запуск

```bash
npm install
npx playwright install
npm start        # http://localhost:4173/dashboard
npm run lint
npm test         # все тесты, 3 браузера
```

## Что проверяют тесты

`tests/menu-behavior.spec.js`, мобильный Offcanvas: открытие, Esc, клик по backdrop, кнопка закрытия, возврат фокуса на кнопку меню, focus trap (Tab и Shift+Tab), закрытие при переходе, фокус на заголовок новой страницы, кнопка Назад, расширение окна до desktop при открытом меню. Desktop: sidebar, skip link, переключатель контекста, 404.

`tests/matrix.spec.js`: 6 маршрутов x 6 ширин (320, 375, 768, 991, 992, 1440) x 3 браузера (Chromium, Firefox, WebKit) = 108 сочетаний. В каждом: заголовок, title, крошки, aria-current, видимость sidebar или кнопки меню по ширине, отсутствие горизонтального скролла, проверка axe (WCAG 2 A/AA).

## Заметки

- WebKit на macOS не ставит Tab на ссылки и кнопки по умолчанию, поэтому в тестах для него используется Option+Tab.
- Решение по фокусу: Esc, backdrop и кнопка закрытия возвращают фокус на кнопку меню; переход по пункту закрывает меню и переносит фокус на h1 новой страницы.
