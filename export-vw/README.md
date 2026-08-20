# @ravenluke/figma-scale

Converts Figma design canvas px values into responsive CSS `calc()` strings that scale with the live viewport — so your designs stay proportional at any screen size without media query breakpoints.

Works in any JS/TS project: Next.js, React, Vue, Vite, vanilla JS, etc.

---

## Install

```bash
npm install @ravenluke/figma-scale
```

---

## How it works

Call `initFigmaScale()` once at your app's entry point. It sets two CSS custom properties on `:root`:

- `--figma-scale-w` = `window.innerWidth / canvasW` (updates on resize)
- `--figma-scale-h` = `window.innerHeight / canvasH` (updates on resize)

Then `vw(px)` and `vh(px)` return `calc()` strings that multiply your Figma px value by those variables:

```
vw(200)  →  calc(200px * var(--figma-scale-w) * 0.6)
```

The element's rendered size scales proportionally with the viewport — matching your Figma design at the exact canvas dimensions, and shrinking/growing smoothly at any other size.

---

## Usage

### Vanilla JS / any framework

Call `initFigmaScale` in your entry file, then use `vw` / `vh` anywhere:

```ts
// main.ts / index.ts
import { initFigmaScale } from '@ravenluke/figma-scale'

initFigmaScale({
  canvasW: 1728,   // your Figma canvas width
  canvasH: 1117,   // your Figma canvas height
  scale: 0.6,      // global multiplier — tune if elements look too big/small
})
```

```ts
// any component / module
import { vw, vh } from '@ravenluke/figma-scale'

element.style.width  = vw(200)   // "calc(200px * var(--figma-scale-w) * 0.6)"
element.style.height = vh(100)   // "calc(100px * var(--figma-scale-h) * 0.6)"
element.style.fontSize = vw(24)
```

---

### React / Vite

```tsx
// src/main.tsx
import { initFigmaScale } from '@ravenluke/figma-scale'

initFigmaScale({ canvasW: 1440, canvasH: 900, scale: 0.55 })
```

```tsx
// src/components/Hero.tsx
import { vw, vh } from '@ravenluke/figma-scale'

export function Hero() {
  return (
    <div style={{ width: vw(800), height: vh(400) }}>
      <h1 style={{ fontSize: vw(64) }}>Hello</h1>
    </div>
  )
}
```

---

### Next.js (App Router)

Next.js renders on the server, so the init script must run as an inline `<script>` before first paint. Use `getScriptString()` for this — it returns a self-contained IIFE with your config baked in.

```tsx
// app/layout.tsx
import { getScriptString } from '@ravenluke/figma-scale'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: getScriptString({ canvasW: 1728, canvasH: 1117, scale: 0.6 }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

```tsx
// anywhere in your components (client or server)
import { vw, vh } from '@ravenluke/figma-scale'

export function Card() {
  return (
    <div style={{ width: vw(320), height: vh(200), fontSize: vw(16) }}>
      ...
    </div>
  )
}
```

> **Note:** `initFigmaScale()` is not needed in Next.js when you use `getScriptString()` in the layout — the inline script handles the runtime setup. Import `vw` / `vh` directly in your components.

---

### Next.js (Pages Router)

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'
import { getScriptString } from '@ravenluke/figma-scale'

export default function Document() {
  return (
    <Html>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: getScriptString() }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

---

## Config options

All fields are optional. Defaults are shown.

| Option | Type | Default | Description |
|---|---|---|---|
| `canvasW` | `number` | `1728` | Width of your Figma design canvas in px |
| `canvasH` | `number` | `1117` | Height of your Figma design canvas in px |
| `scale` | `number` | `0.6` | Global multiplier on top of the viewport scale. Decrease if elements look too big, increase if too small |
| `fallbackW` | `number` | `1280 / canvasW` | Value for `--figma-scale-w` before the script runs (SSR / first paint). Auto-computed if not set |
| `fallbackH` | `number` | `800 / canvasH` | Value for `--figma-scale-h` before the script runs (SSR / first paint). Auto-computed if not set |

---

## API

```ts
// Sets up CSS vars + resize listener. Call once at app entry.
// Not needed in Next.js if you use getScriptString() in the layout.
initFigmaScale(config?: FigmaScaleConfig): void

// Convert a Figma px value using the horizontal scale.
vw(px: number): string

// Convert a Figma px value using the vertical scale.
vh(px: number): string

// Returns a self-contained inline script string for SSR frameworks.
// Config values are baked in as literals — no runtime imports needed.
getScriptString(config?: FigmaScaleConfig): string
```

---

## CSS fallback (optional)

If you want fallback values in CSS instead of relying on the script, add this to your global stylesheet. Replace the values with `1280 / yourCanvasW` and `800 / yourCanvasH`:

```css
:root {
  --figma-scale-w: 0.7407;   /* 1280 / 1728 */
  --figma-scale-h: 0.7162;   /* 800  / 1117 */
}
```

This is handled automatically by `initFigmaScale` and `getScriptString`, so you only need this if you're managing CSS variables yourself.

---

## License

MIT © Raven Luke Quinto
