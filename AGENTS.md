# Repository Guidelines

## Project Structure & Module Organization
- Entry points: `index.html`, `src/main.tsx` (React Router, React Query setup).
- Source: `src/` with key folders:
  - `src/pages/` (route views), `src/components/` (reusable UI), `src/api/` (Axios instance + interceptors),
    `src/queries/` (TanStack Query keys/hooks), `src/stores/` (Zustand), `src/utils/`, `src/common/` (e.g., constants), `src/assets/`, `src/icons/`.
- Build output: `dist/`. Tailwind configured in `tailwind.config.ts` and styles in `src/index.css`.

## Build, Test, and Development Commands
- Install: `npm install`
- Dev server: `npm run dev` (Vite with HMR; `--host` enabled)
- Type-check + build: `npm run build:tsc`
- Build only: `npm run build`
- Preview production build: `npm run preview`
- Lint: `npm run lint`

## Coding Style & Naming Conventions
- Language: TypeScript (strict, no unused locals/params). Configure via `tsconfig.app.json`.
- Linting: ESLint (`@rocketseat/eslint-config/react`). Fix before committing: `npm run lint -- --fix`.
- Indentation: 2 spaces; prefer single quotes.
- Components: PascalCase files (e.g., `MenuAside.tsx`, `QuickAddModal.tsx`).
- Hooks: `useX.ts` in `src/hooks/`. Utilities: camelCase (`src/utils/formatCurrency.ts`).
- Constants: UPPER_SNAKE_CASE in `src/common/constants`.

## Testing Guidelines
- No test runner configured yet. If adding tests, prefer Vitest + React Testing Library.
- Co-locate tests as `*.test.ts`/`*.test.tsx` near the unit (e.g., `components/Button.test.tsx`).
- Mock network via Axios instance; avoid real HTTP. Aim to cover hooks/utils and page-level behavior.

## Commit & Pull Request Guidelines
- Use Conventional Commits (seen in history): `feat:`, `fix:`, `refactor:`, `chore:`…
- Keep PRs focused; include description, linked issues, and UI screenshots for visual changes.
- Before opening a PR: `npm run lint`, ensure dev build runs, update docs if behavior/config changes.

## Security & Configuration
- Env: `.env` with `VITE_BACKEND_URL` (Vite exposes only `VITE_*`). Do not commit secrets.
- Routing on Vercel handled via `vercel.json` rewrites. Avoid logging tokens; Axios interceptors in `src/api/` manage auth and refresh.
