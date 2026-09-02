---
name: shadcn-ui
description: UI component conventions using shadcn/ui (base-nova style) built on @base-ui/react in this project.
---

# shadcn/ui (base-ui)

UI primitives are shadcn-generated, style `base-nova`, built on `@base-ui/react` (NOT Radix).

- Generated primitives live in `src/components/ui/` (button, input, dialog, table, card, select, ...).
- When adding UI, generate/extend the shadcn component — do not pull in a separate component library.
- Use `lucide-react` for icons and `sonner` for toasts (mounted in `src/main.tsx`).
- Compose variants with `class-variance-authority` + `cn()` from `src/lib/utils.ts`.
- Keep new primitives consistent with the existing `src/components/ui` API (forwardRef, `className` passthrough, controlled/uncontrolled support).
