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
- Archive excludes: `node_modules`, `.next`, `dist`, `build`, `coverage`, `.git`.

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

## Последние проверки

- `npm run check` — passed.
- `npm run build` — passed.

## Активные блокеры

Нет активных блокеров.
