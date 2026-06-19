# AGENT_NOTES.md

Рабочие заметки AI coding agent для репозитория Kidan Shop.

## Правила ведения

- Записывать сюда только актуальные блокеры, риски, решения и контекст, который поможет продолжить работу.
- Не записывать секреты, токены, содержимое `.env` или приватные ключи.
- Если задача заблокирована, фиксировать:
  - что пытались сделать;
  - где возникла проблема;
  - точное сообщение ошибки, если оно есть;
  - безопасный следующий шаг.
- После решения блокера можно пометить запись как `resolved` или перенести вывод в документацию.

## Текущий статус

- Репозиторий изучен на верхнем уровне.
- Код приложения не изменялся в рамках подготовки agent-файлов.
- Созданы/проверены рабочие документы:
  - `AGENTS.md`
  - `TASKS.md`
  - `AGENT_NOTES.md`

## Наблюдения по проекту

- Проект: `kidan-shop`, статический HTML/CSS/JS сайт с Vercel serverless API.
- Основные файлы приложения: `index.html`, `profile.html`, `script.js`, `style.css`.
- API находится в `api/`:
  - `api/security-utils.js`
  - `api/create-checkout-session.js`
  - `api/stripe-webhook.js`
  - `api/support.js`
  - `api/support-admin.js`
- Проверки из `package.json`:
  - `npm run check`
  - `npm run build` (`build` сейчас запускает `check`)
- Реальный `README.md` в корне проекта пока отсутствует.

## Safety snapshot

- Branch for autonomous work: `ai/hermes-auto-work`.
- Backup commit created: `Backup before Hermes autonomous work`.
- Backup archive created next to project:
  - `/c/Users/Kostya/Desktop/kidan/kidan-hermes-backup-20260618-220651.tar.gz`
- Current session backup archive created next to project:
  - `/c/Users/Kostya/Desktop/kidan/kidan-hermes-backup-20260619-223836.tar.gz`
- Archive excludes: `node_modules`, `.next`, `dist`, `build`, `coverage`, `.git`.

## Current autonomous session

- Bootstrap checks completed:
  - Working directory: `/c/Users/Kostya/Desktop/kidan/kidan`.
  - Current branch: `ai/hermes-auto-work`.
  - `AGENTS.md`, `TASKS.md`, and `AGENT_NOTES.md` exist.
  - Git status was clean before starting code/doc edits.
- Plan: continue from the next incomplete safe task in `TASKS.md`; first verify previous task coverage, then work on accessibility alt text improvements without changing app behavior.
- Task 7 plan: verify existing `scripts/check-local-links.js` and npm wiring, run link/check/build commands, then mark the task complete if the local-link guard already covers HTML href/src targets.
- Task 8 plan: improve only local UI empty-state copy/actions for wishlist, chats, and profile listings; avoid Supabase access or data/schema changes; validate with syntax/check/build.

## Выполненная автономная работа

- Создан `README.md` с локальным запуском, структурой страниц, переменными окружения и ссылками на setup-доки.
- Создан `DEPLOY_CHECKLIST.md` с безопасным чеклистом перед деплоем.
- Добавлены безопасные npm-проверки:
  - `npm run check:json`
  - `npm run check:files`
  - `npm run check:links`
  - `npm run check:syntax`
- `npm run check` теперь запускает JSON/file/link/syntax проверки.
- `npm run build` успешно запускает `npm run check`.
- Улучшены alt-тексты для логотипов брендов на главной странице и динамических изображений товаров/чатов в `script.js` без изменения поведения.
- Проверена уже добавленная защита от битых локальных ссылок: `scripts/check-local-links.js` покрывает локальные `href`/`src` в 35 HTML-файлах и подключена к `npm run check`.
- Улучшены пустые состояния для wishlist, chats и profile listings: добавлены более понятные заголовки, подсказки и безопасные локальные CTA без изменения данных или удалённого доступа.

## Последние проверки

- `node` inline check for static HTML images missing alt — passed (`0`).
- `npm run check:links` — passed.
- `npm run check` — passed.
- `npm run build` — passed.
- `node` inline parse check for `profile.html` scripts — passed (`2` inline script blocks).

## Активные блокеры

Нет активных блокеров.
