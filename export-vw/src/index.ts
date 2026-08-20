// ─────────────────────────────────────────────────────────────────────────────
// @ravenluke/figma-scale
// Figma px → responsive CSS calc utility
// Maps a fixed Figma canvas size to live viewport scale via CSS custom props.
// Zero dependencies. Works in any JS/TS framework (Next.js, React, Vue, Vite,
// vanilla JS, etc.) as well as server-side environments (SSR-safe).
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FigmaScaleConfig {
  /** Width of your Figma design canvas in px. Default: 1728 */
  canvasW?: number;
  /** Height of your Figma design canvas in px. Default: 1117 */
  canvasH?: number;
  /**
   * Global multiplier applied on top of the viewport scale.
   * Dial down if everything looks too big, up if too small. Default: 0.6
   */
  scale?: number;
  /**
   * Fallback value for --figma-scale-w injected into :root via CSS.
   * Applied before the init script runs (SSR / first paint).
   * Default: computed as 1280 / canvasW
   */
  fallbackW?: number;
  /**
   * Fallback value for --figma-scale-h injected into :root via CSS.
   * Applied before the init script runs (SSR / first paint).
   * Default: computed as 800 / canvasH
   */
  fallbackH?: number;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_CANVAS_W = 1728;
const DEFAULT_CANVAS_H = 1117;
const DEFAULT_SCALE = 0.6;

// ── Module-level resolved config ──────────────────────────────────────────────
// vw() / vh() read `_scale` so they work independently of initFigmaScale.
// initFigmaScale updates this when called.

let _scale: number = DEFAULT_SCALE;
let _canvasW: number = DEFAULT_CANVAS_W;
let _canvasH: number = DEFAULT_CANVAS_H;

// ── Core init ─────────────────────────────────────────────────────────────────

/**
 * Sets up the CSS custom properties `--figma-scale-w` and `--figma-scale-h`
 * on `document.documentElement`, and keeps them updated on window resize.
 *
 * Call this once in your app's entry file / root layout.
 * Safe to call in SSR environments — DOM access is guarded.
 *
 * @example
 * // Use all defaults (1728×1117 canvas, scale 0.6)
 * initFigmaScale()
 *
 * @example
 * // Custom canvas size
 * initFigmaScale({ canvasW: 1440, canvasH: 900, scale: 0.55 })
 */
export function initFigmaScale(config?: FigmaScaleConfig): void {
  // Merge with defaults
  const canvasW = config?.canvasW ?? DEFAULT_CANVAS_W;
  const canvasH = config?.canvasH ?? DEFAULT_CANVAS_H;
  const scale = config?.scale ?? DEFAULT_SCALE;
  const fallbackW = config?.fallbackW ?? parseFloat((1280 / canvasW).toFixed(4));
  const fallbackH = config?.fallbackH ?? parseFloat((800 / canvasH).toFixed(4));

  // Update module-level vars so vw() / vh() reflect this config
  _scale = scale;
  _canvasW = canvasW;
  _canvasH = canvasH;

  // SSR guard — do nothing if there is no DOM
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  function update(): void {
    root.style.setProperty(
      "--figma-scale-w",
      (window.innerWidth / canvasW).toFixed(4)
    );
    root.style.setProperty(
      "--figma-scale-h",
      (window.innerHeight / canvasH).toFixed(4)
    );
  }

  // Set fallbacks first so there's never a flash of zero-sized elements
  root.style.setProperty("--figma-scale-w", fallbackW.toFixed(4));
  root.style.setProperty("--figma-scale-h", fallbackH.toFixed(4));

  // Then immediately compute from real viewport
  update();

  // Keep in sync on resize
  window.addEventListener("resize", update);
}

// ── Utility functions ─────────────────────────────────────────────────────────

/**
 * Convert a Figma px value to a responsive CSS `calc()` string using the
 * horizontal scale factor.
 *
 * @param px - The pixel value from your Figma design
 * @returns A CSS calc string, e.g. `"calc(200px * var(--figma-scale-w) * 0.6)"`
 *
 * @example
 * // In a React / Next.js component:
 * <div style={{ width: vw(200), height: vh(100) }} />
 */
export function vw(px: number): string {
  return `calc(${px}px * var(--figma-scale-w) * ${_scale})`;
}

/**
 * Convert a Figma px value to a responsive CSS `calc()` string using the
 * vertical scale factor.
 *
 * @param px - The pixel value from your Figma design
 * @returns A CSS calc string, e.g. `"calc(100px * var(--figma-scale-h) * 0.6)"`
 */
export function vh(px: number): string {
  return `calc(${px}px * var(--figma-scale-h) * ${_scale})`;
}

// ── SSR / Next.js inline script helper ───────────────────────────────────────

/**
 * Returns a self-contained inline script string that sets the CSS custom
 * properties before first paint. Designed for frameworks that need a raw
 * script string, such as Next.js `dangerouslySetInnerHTML`.
 *
 * The returned string is a complete IIFE — no imports, no external deps.
 * Bakes the resolved config values in as literals so the script is portable.
 *
 * @example Next.js app/layout.tsx
 * ```tsx
 * import { getScriptString } from '@ravenluke/figma-scale'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <script dangerouslySetInnerHTML={{ __html: getScriptString({ canvasW: 1728, canvasH: 1117 }) }} />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   )
 * }
 * ```
 */
export function getScriptString(config?: FigmaScaleConfig): string {
  const canvasW = config?.canvasW ?? DEFAULT_CANVAS_W;
  const canvasH = config?.canvasH ?? DEFAULT_CANVAS_H;
  const fallbackW = config?.fallbackW ?? parseFloat((1280 / canvasW).toFixed(4));
  const fallbackH = config?.fallbackH ?? parseFloat((800 / canvasH).toFixed(4));

  // Bake all values as literals — the returned string is fully self-contained
  return `(function(){` +
    `var r=document.documentElement;` +
    `r.style.setProperty('--figma-scale-w','${fallbackW.toFixed(4)}');` +
    `r.style.setProperty('--figma-scale-h','${fallbackH.toFixed(4)}');` +
    `function u(){` +
      `r.style.setProperty('--figma-scale-w',(window.innerWidth/${canvasW}).toFixed(4));` +
      `r.style.setProperty('--figma-scale-h',(window.innerHeight/${canvasH}).toFixed(4));` +
    `}` +
    `u();` +
    `window.addEventListener('resize',u);` +
  `})();`;
}
