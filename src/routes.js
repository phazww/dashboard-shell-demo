import { renderDashboard, renderOverview, renderProfile, renderProfessional, renderWorkContexts, renderSettings } from './pages.js';

// Route registry: single source of truth for the router, the sidebar and the breadcrumbs.
export const routes = [
  { path: '/dashboard', title: 'Главная', nav: 'Главная', render: renderDashboard },
  { path: '/dashboard/overview', title: 'Обзор', nav: 'Обзор', parent: '/dashboard', render: renderOverview },
  { path: '/dashboard/profile', title: 'Профиль', nav: 'Профиль', parent: '/dashboard', render: renderProfile },
  {
    path: '/dashboard/profile/professional',
    title: 'Профессиональные данные',
    nav: 'Профессиональные данные',
    parent: '/dashboard/profile',
    render: renderProfessional,
  },
  { path: '/dashboard/work-contexts', title: 'Рабочие контексты', nav: 'Рабочие контексты', parent: '/dashboard', render: renderWorkContexts },
  { path: '/dashboard/settings', title: 'Настройки', nav: 'Настройки', parent: '/dashboard', render: renderSettings },
];

export const findRoute = (path) => routes.find((r) => r.path === path);

export function breadcrumbTrail(route) {
  const trail = [];
  for (let r = route; r; r = r.parent ? findRoute(r.parent) : null) trail.unshift(r);
  return trail;
}
