# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vite-powered React 19 and TypeScript admin application. Application code lives in `src/`: route-level screens are in `pages/`, reusable widgets in `components/`, layouts in `layout/`, and cross-cutting capabilities such as language, theme, routing, and state in `features/`. API clients, query hooks, keys, and types belong under `src/services/api/`; route definitions belong in `src/routers/`. Static files served unchanged go in `public/`, while imported images and SVGs go in `src/assets/`. Keep generated output in `dist/` out of source changes.

## Build, Test, and Development Commands

Use pnpm; `pnpm-lock.yaml` is the authoritative lockfile.

- `pnpm install` installs dependencies and configures Husky hooks.
- `pnpm dev` starts the Vite development server.
- `pnpm typecheck` runs TypeScript without emitting files.
- `pnpm lint` checks the repository with ESLint; `pnpm lint:fix` applies safe fixes.
- `pnpm format` formats TypeScript and TSX with Prettier, including Tailwind class ordering.
- `pnpm build` type-checks and creates the production bundle in `dist/`.
- `pnpm preview` serves the production build locally.

## Coding Style & Naming Conventions

Follow `eslint.config.js`: two-space indentation, single quotes, and Stroustrup brace style. Use TypeScript for new code and prefer the `@/` alias for imports from `src/`. Name React components and their files in PascalCase (`ThemeProvider.tsx`), hooks with a `use` prefix (`useAuth.ts`), and utilities or configuration modules in camelCase. Keep feature-specific code together; place broadly reusable primitives under `components/`. Generated UI code in `src/components/ui/` and `src/components/diceui/` is excluded from ESLint, so avoid unrelated manual rewrites there.

## Testing Guidelines

No automated test framework or coverage threshold is currently configured. Before submitting changes, run `pnpm lint`, `pnpm typecheck`, and `pnpm build`, then manually exercise affected routes and both supported locales when UI text changes. If adding tests, colocate them as `*.test.ts` or `*.test.tsx` and add the corresponding runner command to `package.json`.

## Commit & Pull Request Guidelines

Commits follow Conventional Commits, enforced by commitlint: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:`, or `revert:`. Subjects may be Chinese or English; keep them brief and imperative, for example `fix: 修复登录布局背景颜色`. Pre-commit hooks run lint-staged and type checking, while pre-push builds the project. Pull requests should describe the change, verification performed, and linked issue; include screenshots or recordings for visible UI changes and call out configuration or translation updates.

## Agent skills

### Issue tracker

Issues are tracked as local Markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default canonical label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Domain documentation uses a single-context layout. See `docs/agents/domain.md`.

### 补充约束

开发前端页面时，尽量复用shadcn组件库，或者基于现有的shadcn组件进行封装。并参考shadcn/ui这个skill
