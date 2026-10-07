// The app can live under a sub-path (GitHub Pages: /dashboard-shell-demo). The build writes it into <meta name="app-base">.
export const BASE = (document.querySelector('meta[name="app-base"]')?.content || '').replace(/\/$/, '');

export const withBase = (path) => BASE + path;

export function stripBase(pathname) {
  const p = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  return p.replace(/(.)\/$/, '$1') || '/';
}

export const currentPath = () => stripBase(location.pathname);
