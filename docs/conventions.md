# Project Conventions

## Tech Stack

| Layer       | Choice                      |
|-------------|-----------------------------|
| Framework   | Next.js 16 (App Router)     |
| Language    | TypeScript (strict mode)    |
| Styling     | Tailwind CSS v4             |
| Package     | npm                         |

## Folder Structure

```
portfolio2/
├── app/                          # Routing only — no component logic here
│   ├── layout.tsx                # Root layout (html, body, fonts, metadata)
│   ├── page.tsx                  # Single-page composition (imports sections)
│   └── globals.css               # Tailwind v4 entry point
│
├── components/                   # All UI code lives here
│   ├── sections/                 # Page-level section components
│   │   ├── hero.tsx              #   — Hero / landing section
│   │   ├── about.tsx             #   — About me section
│   │   ├── projects.tsx          #   — Projects / work showcase
│   │   └── contact.tsx           #   — Contact / CTA section
│   └── ui/                       # Reusable primitives (design system)
│       ├── button.tsx            #   — Shared button component
│       ├── card.tsx              #   — Shared card component
│       └── ...                   #   — Badge, SectionHeading, etc.
│
├── lib/                          # Utilities, data, and types
│   ├── utils.ts                  #   — Helper functions (cn, formatters, etc.)
│   ├── data.ts                   #   — Static data (projects list, links, etc.)
│   └── types.ts                  #   — Shared TypeScript types/interfaces
│
├── public/                       # Static assets (images, fonts, icons)
├── docs/                         # Project documentation
│   └── conventions.md            #   — This file
│
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
└── eslint.config.mjs             # ESLint config
```

## Conventions

### 1. `app/` is for routing only
- The `app/` directory defines URL structure — nothing else.
- Never put component logic, utilities, or data fetching directly in `app/` files.
- `page.tsx` is a thin composition layer: it imports sections and lays them out.

### 2. Sections are components
- "Sections" (Hero, About, Projects) are just React components — they live in `components/sections/`.
- Each section is one file. If a section grows complex, it gets its own subfolder:
  ```
  components/sections/projects/
  ├── index.tsx          # Public entry — composes sub-components
  ├── project-card.tsx   # Internal to this section only
  └── project-list.tsx   # Internal to this section only
  ```

### 3. `ui/` vs `sections/`
| Folder                  | Purpose                                                |
|-------------------------|--------------------------------------------------------|
| `components/ui/`        | Generic, reusable primitives (Button, Card, Badge)     |
| `components/sections/`  | Page-level blocks that compose ui primitives           |

Rule of thumb: if a component could reasonably be copied into another project and work standalone, it belongs in `ui/`. If it's specific to this portfolio's content or layout, it's a section.

### 4. Imports use the `@/` alias
- `@/` maps to the project root (configured in `tsconfig.json`).
- Always use alias imports, never relative imports across folders:

  ```tsx
  // ✅ Good
  import { Button } from "@/components/ui/button";
  import { Hero } from "@/components/sections/hero";

  // ❌ Avoid
  import { Button } from "../../components/ui/button";
  ```

### 5. Server Components by default
- All components are Server Components unless they need interactivity.
- Only add `"use client"` when you need: event handlers (`onClick`), state (`useState`), effects (`useEffect`), or browser APIs.
- Push `"use client"` as deep as possible — mark a leaf `<SearchInput />` as client, not the entire `<Navbar />`.

### 6. File naming
- Components: `kebab-case.tsx` (`hero.tsx`, `project-card.tsx`)
- Utilities: `kebab-case.ts` (`utils.ts`, `data.ts`)
- Types: `kebab-case.ts` (`types.ts`)

### 7. Tailwind v4
- Tailwind v4 uses CSS-first configuration via `@theme` in `globals.css` — no `tailwind.config.js`.
- Use `@apply` sparingly; prefer composing utility classes inline.
- Custom theme tokens (colors, spacing, fonts) go in `globals.css` under `@theme {}`.
