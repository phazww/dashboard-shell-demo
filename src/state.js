// Demo state: lives in memory only, no persistence, no backend.
const contexts = [
  { id: 'studio', name: 'Студия Альфа', role: 'Владелец', projects: 12, tasks: 34 },
  { id: 'school', name: 'Школа Бета', role: 'Преподаватель', projects: 4, tasks: 9 },
  { id: 'personal', name: 'Личное пространство', role: 'Участник', projects: 2, tasks: 5 },
];

const listeners = new Set();
let activeId = contexts[0].id;

export const getContexts = () => contexts;
export const getActive = () => contexts.find((c) => c.id === activeId);

export function setActive(id) {
  if (!contexts.some((c) => c.id === id) || id === activeId) return;
  activeId = id;
  listeners.forEach((fn) => fn(getActive()));
}

export const onContextChange = (fn) => listeners.add(fn);
