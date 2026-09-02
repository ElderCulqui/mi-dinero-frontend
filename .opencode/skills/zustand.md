---
name: zustand
description: Zustand state management conventions for this project (stores, middleware, selectors, persistence).
---

# Zustand

Zustand is the only global state library (no Redux, no Context API).

- Stores live in `src/stores/` (e.g. `authStore.ts`).
- Use `devtools` + `persist` middleware; persist key e.g. `auth-storage`.
- One store per domain. Keep stores small and focused.
- Read state with granular selectors to avoid unnecessary re-renders (e.g. `useAuthStore(s => s.token)`).
- Access the store outside React via `store.getState()` / `store.setState()` (used in axios interceptors in `src/services/api.ts`).
- Do not put ephemeral/component-local state in a global store — keep it in `useState`.
