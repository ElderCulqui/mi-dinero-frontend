---
name: tailwind
description: Tailwind CSS v4 conventions for this project (Vite plugin, theme tokens, class utilities, cn helper).
---

# Tailwind CSS v4

Stack: Tailwind v4 via `@tailwindcss/vite` (no PostCSS config). Entry is `src/index.css` with `@import "tailwindcss";`.

- Theme tokens / custom utilities go in `src/index.css` (v4 CSS-first config, not `tailwind.config.js`).
- Compose classes with the `cn()` helper in `src/lib/utils.ts` (`clsx` + `tailwind-merge` + `cva`).
- Prefer Tailwind utilities over custom CSS. Only add raw CSS when a utility is not viable.
- Use design tokens / theme variables, not hardcoded colors, for consistency with shadcn components.
- Icons come from `lucide-react`, not icon fonts.
