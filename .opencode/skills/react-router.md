---
name: react-router
description: React Router v7 routing conventions for this project (routes, pages, protected routes, auth gating).
---

# React Router v7

Stack: `react-router-dom` v7 with `BrowserRouter` + `Routes`/`Route` defined in `src/App.tsx`.

- Route pages live in `src/pages/` and are wired in `src/App.tsx`.
- Protected routes use the `ProtectedRoute` component, which reads auth from the Zustand `authStore`.
- Private routes: `/dashboard`, `/accounts`, `/categories`. Public: `/login`.
- Use the `@/*` alias for page/component imports.
- Redirect unauthenticated users to `/login` from `ProtectedRoute`.
- Keep layout/components for routes in `src/components/layouts/`.
