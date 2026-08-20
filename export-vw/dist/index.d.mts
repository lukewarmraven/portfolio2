interface FigmaScaleConfig {
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
declare function initFigmaScale(config?: FigmaScaleConfig): void;
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
declare function vw(px: number): string;
/**
 * Convert a Figma px value to a responsive CSS `calc()` string using the
 * vertical scale factor.
 *
 * @param px - The pixel value from your Figma design
 * @returns A CSS calc string, e.g. `"calc(100px * var(--figma-scale-h) * 0.6)"`
 */
declare function vh(px: number): string;
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
declare function getScriptString(config?: FigmaScaleConfig): string;

export { type FigmaScaleConfig, getScriptString, initFigmaScale, vh, vw };
