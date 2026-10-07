import { getActive, getContexts, setActive } from './state.js';

const card = (title, text, href) => `
  <div class="card h-100">
    <div class="card-body">
      <h2 class="h5 card-title">${title}</h2>
      <p class="card-text text-body-secondary">${text}</p>
      <a href="${href}" data-route class="btn btn-outline-primary btn-sm">Открыть</a>
    </div>
  </div>`;

export function renderDashboard(view) {
  view.innerHTML = `
    <h1 tabindex="-1" class="h3 mb-1">Главная</h1>
    <p class="text-body-secondary">Рабочий контекст: <strong data-active-context>${getActive().name}</strong></p>
    <div class="card-grid mt-3">
      ${card('Обзор', 'Сводка по проектам и задачам выбранного контекста.', '/dashboard/overview')}
      ${card('Профиль', 'Основные данные и профессиональная информация.', '/dashboard/profile')}
      ${card('Рабочие контексты', 'Переключение между пространствами.', '/dashboard/work-contexts')}
      ${card('Настройки', 'Уведомления и язык интерфейса.', '/dashboard/settings')}
    </div>`;
}

export function renderOverview(view) {
  const c = getActive();
  view.innerHTML = `
    <h1 tabindex="-1" class="h3 mb-1">Обзор</h1>
    <p class="text-body-secondary">Контекст: <strong data-active-context>${c.name}</strong>, роль: <span data-active-role>${c.role}</span></p>
    <div class="card-grid my-3">
      <div class="card"><div class="card-body"><p class="text-body-secondary mb-1">Проекты</p><p class="display-6 mb-0" data-stat="projects">${c.projects}</p></div></div>
      <div class="card"><div class="card-body"><p class="text-body-secondary mb-1">Открытые задачи</p><p class="display-6 mb-0" data-stat="tasks">${c.tasks}</p></div></div>
    </div>
    <div class="table-responsive" tabindex="0" role="region" aria-label="Последняя активность">
      <table class="table align-middle">
        <caption class="visually-hidden">Последняя активность</caption>
        <thead><tr><th scope="col">Событие</th><th scope="col">Раздел</th><th scope="col">Когда</th></tr></thead>
        <tbody>
          <tr><td>Обновлён профиль</td><td>Профиль</td><td>Сегодня</td></tr>
          <tr><td>Добавлена задача</td><td>Проекты</td><td>Вчера</td></tr>
          <tr><td>Изменены уведомления</td><td>Настройки</td><td>3 дня назад</td></tr>
        </tbody>
      </table>
    </div>`;
}

function formPage(view, { title, fields }) {
  view.innerHTML = `
    <h1 tabindex="-1" class="h3 mb-3">${title}</h1>
    <form class="row g-3 mw-form" novalidate>
      ${fields
        .map(
          (f) => `
        <div class="col-12">
          <label class="form-label" for="${f.id}">${f.label}</label>
          <input class="form-control" id="${f.id}" name="${f.id}" type="${f.type || 'text'}" value="${f.value}" autocomplete="${f.autocomplete || 'off'}">
        </div>`,
        )
        .join('')}
      <div class="col-12 d-flex flex-wrap align-items-center gap-3">
        <button class="btn btn-primary" type="submit">Сохранить</button>
        <span class="text-success" role="status" data-form-status></span>
      </div>
    </form>`;
  const form = view.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.querySelector('[data-form-status]').textContent = 'Сохранено (demo, данные не отправляются)';
  });
}

export function renderProfile(view) {
  formPage(view, {
    title: 'Профиль',
    fields: [
      { id: 'name', label: 'Имя', value: 'Иван Петров', autocomplete: 'name' },
      { id: 'email', label: 'Email', type: 'email', value: 'demo@example.com', autocomplete: 'email' },
      { id: 'phone', label: 'Телефон', type: 'tel', value: '+7 900 000-00-00', autocomplete: 'tel' },
    ],
  });
  const links = document.createElement('p');
  links.className = 'mt-3';
  links.innerHTML = '<a href="/dashboard/profile/professional" data-route>Перейти к профессиональным данным</a>';
  view.append(links);
}

export function renderProfessional(view) {
  formPage(view, {
    title: 'Профессиональные данные',
    fields: [
      { id: 'position', label: 'Должность', value: 'Руководитель проектов' },
      { id: 'company', label: 'Компания', value: 'Студия Альфа', autocomplete: 'organization' },
      { id: 'skills', label: 'Навыки', value: 'Планирование, аналитика' },
    ],
  });
}

export function renderWorkContexts(view) {
  const render = () => {
    const active = getActive();
    view.innerHTML = `
      <h1 tabindex="-1" class="h3 mb-3">Рабочие контексты</h1>
      <ul class="list-group mw-form">
        ${getContexts()
          .map(
            (c) => `
          <li class="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span><strong>${c.name}</strong><br><small class="text-body-secondary">${c.role}</small></span>
            ${
              c.id === active.id
                ? '<span class="badge text-bg-primary">Активен</span>'
                : `<button type="button" class="btn btn-outline-primary btn-sm" data-switch="${c.id}">Сделать активным<span class="visually-hidden">: ${c.name}</span></button>`
            }
          </li>`,
          )
          .join('')}
      </ul>`;
    view.querySelectorAll('[data-switch]').forEach((btn) =>
      btn.addEventListener('click', () => {
        setActive(btn.dataset.switch);
        render();
        view.querySelector('h1').focus();
      }),
    );
  };
  render();
}

export function renderSettings(view) {
  view.innerHTML = `
    <h1 tabindex="-1" class="h3 mb-3">Настройки</h1>
    <form class="mw-form" novalidate>
      <div class="form-check form-switch mb-3">
        <input class="form-check-input" type="checkbox" role="switch" id="notify-email" checked>
        <label class="form-check-label" for="notify-email">Уведомления на почту</label>
      </div>
      <div class="form-check form-switch mb-3">
        <input class="form-check-input" type="checkbox" role="switch" id="notify-digest">
        <label class="form-check-label" for="notify-digest">Еженедельная сводка</label>
      </div>
      <div class="mb-3">
        <label class="form-label" for="lang">Язык интерфейса</label>
        <select class="form-select" id="lang"><option>Русский</option><option>English</option></select>
      </div>
    </form>`;
}
