---
name: react
description: Conventions for React 19 SPA development in this Vite project (components, pages, hooks, data fetching, lint rules).
---

# React (Vite SPA)

Stack: React 19 + Vite (no Next.js, no RSC). Do NOT use `"use client"` or server components.

- Pages live in `src/pages/`, routed in `src/App.tsx`.
- Reusable components in `src/components/` (feature folders) and `src/components/ui/` (shadcn primitives).
- Custom hooks in `src/hooks/`. Keep data-fetching logic out of components when reusable.
- Use `useState` + `useEffect` for data fetching via the `services/` axios layer (current pattern). If adopting `@tanstack/react-query`, prefer it over manual effects.
- Follow `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` rules (no missing deps, fast-refresh-safe exports).
- Use the `@/*` path alias for imports (e.g. `@/stores/authStore`, `@/services/api`).
- Forms use `react-hook-form` + `zod` schemas (see `AccountForm`, `CategoryForm`, `Login`).
- Types are defined per domain in `src/types/`.
