# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Operating rules

- Work in small, safe, reviewable steps.
- Before making changes, briefly write the plan and intended scope.
- Do not rewrite or significantly change the architecture without explicit permission from the project owner.
- Do not remove existing functionality unless the project owner explicitly asks for it.
- Do not touch `.env` files or secrets. Use `.env.example` only for documenting required variables.
- Do not push, deploy, publish, or run release actions without explicit confirmation from the project owner.
- After making changes, run the available checks from `package.json` when possible.
- If blocked or stuck, write the problem, context, and next suggested step in `AGENT_NOTES.md`.

## Project checks

Current package scripts include:

```bash
npm run check
npm run build
```

Prefer `npm run check` for validation after code changes. `npm run build` currently runs the same checks.

# Autonomous Agent Rules

## Before any work

The agent must create a safety snapshot before editing project files:

1. Show current directory.
2. Run `git status`.
3. Create or switch to branch `ai/hermes-auto-work`.
4. Commit current state with message:
   `Backup before Hermes autonomous work`
5. Create a compressed archive backup of the project outside the project folder.
6. Exclude heavy/generated folders:
   - node_modules
   - .next
   - dist
   - build
   - coverage
   - .git
7. Write the backup path to `AGENT_NOTES.md`.

## Allowed without asking

The agent may:
- edit application code
- add tests
- update docs
- run lint/typecheck/tests/build
- install dependencies only if needed and explained in `AGENT_NOTES.md`

## Not allowed without explicit approval

The agent must not:
- push to remote
- deploy
- edit `.env` or secrets
- delete databases
- run destructive commands
- rewrite the whole architecture
- remove large parts of codeы
- change production configs
- use `git reset --hard`
- use `git clean -fd`