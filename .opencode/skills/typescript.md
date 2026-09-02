---
name: typescript
description: TypeScript conventions for this project (strict mode, path aliases, verbatimModuleSyntax, types per domain).
---

# TypeScript

Stack: TypeScript ~5.9, strict mode. Config in `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json`.

- `strict: true`, `noUnusedLocals`/`noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`.
- Use the `@/*` path alias (`./src/*`) for all internal imports.
- `verbatimModuleSyntax`: use `import type` for type-only imports; avoid `export =` / `import =`.
- `erasableSyntaxOnly`: no enums or namespaces with runtime semantics; prefer `const` objects / `as const` unions.
- Define domain types in `src/types/`; co-locate request/response DTOs with their service.
- Never use `any`. Prefer precise types and generics.
- Scripts: `npm run build` runs `tsc -b && vite build` — keep types clean.
