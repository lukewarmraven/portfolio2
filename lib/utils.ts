/** Dial this down if everything looks too big, up if too small */
const SCALE = 0.6;

/**
 * Figma px → scaled px via CSS variable.
 * --figma-scale-w and --figma-scale-h are set at runtime
 * by the script in app/layout.tsx (viewport / 1728) and
 * fallback in globals.css.
 */
export function vw(px: number): string {
  return `calc(${px}px * var(--figma-scale-w) * ${SCALE})`;
}

export function vh(px: number): string {
  return `calc(${px}px * var(--figma-scale-h) * ${SCALE})`;
}
