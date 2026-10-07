import { routes, findRoute, breadcrumbTrail } from './routes.js';
import { getActive, getContexts, onContextChange, setActive } from './state.js';
import { withBase, stripBase, currentPath } from './base.js';

const { Offcanvas } = window.bootstrap;

const $ = (sel) => document.querySelector(sel);
const view = $('#view');
const sidebarEl = $('#sidebar');
const sidebar = Offcanvas.getOrCreateInstance(sidebarEl);

/* ---------- sidebar navigation ---------- */

function renderNav(currentPath) {
  const link = (r) => {
    const isCurrent = r.path === currentPath;
    const isAncestor = !isCurrent && currentPath.startsWith(`${r.path}/`) && r.path !== '/dashboard';
    return `<a class="nav-link${isAncestor ? ' is-ancestor' : ''}" href="${withBase(r.path)}" data-route${isCurrent ? ' aria-current="page"' : ''}>${r.nav}</a>`;
  };
  const top = routes.filter((r) => !r.path.endsWith('/professional'));
  const professional = routes.find((r) => r.path.endsWith('/professional'));
  $('#main-nav').innerHTML = `<ul class="nav nav-pills flex-column nav-tree gap-1">${top
    .map(
      (r) =>
        `<li class="nav-item">${link(r)}${
          r.path === '/dashboard/profile' ? `<ul class="nav flex-column nav-sub mt-1"><li class="nav-item">${link(professional)}</li></ul>` : ''
        }</li>`,
    )
    .join('')}</ul>`;
}

function renderBreadcrumbs(route) {
  const trail = breadcrumbTrail(route);
  $('#breadcrumbs').innerHTML = `<ol class="breadcrumb">${trail
    .map((r, i) =>
      i === trail.length - 1
        ? `<li class="breadcrumb-item active" aria-current="page">${r.title}</li>`
        : `<li class="breadcrumb-item"><a href="${withBase(r.path)}" data-route>${r.title}</a></li>`,
    )
    .join('')}</ol>`;
}

/* ---------- work context switcher ---------- */

function renderContextMenu() {
  const active = getActive();
  $('#context-label').textContent = active.name;
  $('#context-menu').innerHTML = getContexts()
    .map(
      (c) =>
        `<li><button class="dropdown-item d-flex justify-content-between gap-3" type="button" data-context="${c.id}"${
          c.id === active.id ? ' aria-current="true"' : ''
        }>${c.name}${c.id === active.id ? ' <span aria-hidden="true">✓</span>' : ''}</button></li>`,
    )
    .join('');
}

$('#context-menu').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-context]');
  if (btn) setActive(btn.dataset.context);
});

onContextChange((ctx) => {
  renderContextMenu();
  $('#live').textContent = `Рабочий контекст: ${ctx.name}`;
  // keep the open page in sync with the active context
  view.querySelectorAll('[data-active-context]').forEach((el) => (el.textContent = ctx.name));
  view.querySelectorAll('[data-active-role]').forEach((el) => (el.textContent = ctx.role));
  view.querySelectorAll('[data-stat]').forEach((el) => (el.textContent = ctx[el.dataset.stat]));
});

/* ---------- router ---------- */

function renderNotFound() {
  document.title = 'Страница не найдена · Shell Demo';
  $('#breadcrumbs').innerHTML = '';
  renderNav('');
  view.innerHTML = `<h1 tabindex="-1" class="h3">Страница не найдена</h1><p><a href="${withBase('/dashboard')}" data-route>Вернуться на главную</a></p>`;
}

function render(path) {
  const route = findRoute(path);
  if (!route) return renderNotFound();
  document.title = `${route.title} · Shell Demo`;
  renderNav(route.path);
  renderBreadcrumbs(route);
  view.innerHTML = '';
  route.render(view);
}

function focusHeading() {
  const h1 = view.querySelector('h1');
  if (h1) h1.focus({ preventScroll: false });
}

function navigate(path, { push = true } = {}) {
  if (push && path !== currentPath()) history.pushState({}, '', withBase(path));
  render(path);
  window.scrollTo(0, 0);
  // Offcanvas open (mobile): close it first, then move focus to the new page heading.
  // Doing it after `hidden` keeps our focus from being overwritten by Bootstrap's restore-focus-to-toggler.
  if (sidebarEl.classList.contains('show')) {
    sidebarEl.addEventListener('hidden.bs.offcanvas', focusHeading, { once: true });
    sidebar.hide();
  } else {
    focusHeading();
  }
}

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[data-route]');
  if (!a) return;
  e.preventDefault();
  navigate(stripBase(new URL(a.href).pathname));
});

window.addEventListener('popstate', () => render(currentPath()));

/* ---------- start ---------- */

$('.navbar-brand').setAttribute('href', withBase('/dashboard'));
if (currentPath() === '/') history.replaceState({}, '', withBase('/dashboard'));
renderContextMenu();
render(currentPath());
