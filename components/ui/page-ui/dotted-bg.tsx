"use client";

import { useEffect, useRef } from "react";

/* ============================================================================
 * DottedBg — full-viewport 1‑px dot grid with cursor repulsion
 *
 * Renders a canvas-based grid of pixel-sharp dots that smoothly push away
 * from the mouse cursor and spring back to their original positions.
 * Tune the constants below to change the look and feel.
 *
 * On touch devices or when the user prefers reduced motion the grid renders
 * once statically — no animation loop, battery-friendly.
 * ============================================================================
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                        TUNABLE  PARAMETERS                               ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                          ║
 * ║  DOT_COLOR           CSS colour string for each dot.                     ║
 * ║                       • Use rgba() to control opacity                    ║
 * ║                       • Light theme → dark dots at low alpha             ║
 * ║                       • Dark theme  → light dots (e.g. rgba(255,…,0.18))║
 * ║                                                                          ║
 * ║  DOT_SIZE            px — width & height of each dot (square).           ║
 * ║                       • 1 = crisp single-pixel dot                       ║
 * ║                       • 2 = subtle 2×2 px dot                            ║
 * ║                                                                          ║
 * ║  DOT_GAP             px between dot centres in the grid.                 ║
 * ║                       • 20–40 = good density on a 1080p viewport         ║
 * ║                       • Increase → sparser grid, fewer dots              ║
 * ║                       • Decrease → denser grid, more dots (perf cost)    ║
 * ║                                                                          ║
 * ║  REPULSION_RADIUS    px — how far from the cursor dots start moving.     ║
 * ║                       • 80–200 feels natural                             ║
 * ║                       • Increase → larger "push zone" around cursor      ║
 * ║                       • Decrease → tighter, more localised effect        ║
 * ║                                                                          ║
 * ║  REPULSION_STRENGTH  push force at the cursor centre (px/frame²).        ║
 * ║                       • Higher = dots fly further & faster               ║
 * ║                       • Lower  = subtler, gentler displacement           ║
 * ║                       • 30–60 is a good range; 40 is the default         ║
 * ║                                                                          ║
 * ║  SPRING_K            0–1 spring stiffness pulling dots back home.        ║
 * ║                       • 0.04–0.10 snappy; > 0.15 jitters                 ║
 * ║                       • Increase → dots snap back faster (snappier)      ║
 * ║                       • Decrease → dots drift back lazily (floatier)     ║
 * ║                                                                          ║
 * ║  DAMPING             0–1 velocity friction applied each frame.           ║
 * ║                       • 0.10–0.20 → gentle overshoot settle              ║
 * ║                       • Increase → dots glide longer before stopping     ║
 * ║                       • Decrease → dots stop more abruptly               ║
 * ║                       • 0 = perpetual bounce, 1 = no motion at all       ║
 * ║                                                                          ║
 * ║  MAX_SPEED           px/frame speed clamp. Prevents dots from flying     ║
 * ║                       off-screen on a fast cursor flick.                 ║
 * ║                                                                          ║
 * ║  MAX_OFFSET          px — hard cap on how far a dot can travel from its  ║
 * ║                       home cell. Keeps the grid legible.                 ║
 * ║                                                                          ║
 * ║  FLOAT_AMPLITUDE     px/frame² — gentle idle drift so dots never sit     ║
 * ║                       completely still. 0 = off, 0.02–0.05 = subtle.     ║
 * ║                                                                          ║
 * ║  DPR_CAP             Caps devicePixelRatio for the canvas backing store. ║
 * ║                       2 ≈ visually identical to 3 at ¼ the fill cost.    ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

/* ---- visual ------------------------------------------------------------ */

const DOT_COLOR = "rgba(17, 17, 17, 0.6)";

/** px — width & height of each square dot. 1 = crisp single-pixel dot.    */
const DOT_SIZE = 1;

/** px between dot centres in the grid. 20–40 = good density.              */
const DOT_GAP = 15;

/* ---- behaviour --------------------------------------------------------- */

/** px — dots within this distance of the cursor get pushed. 80–200.       */
const REPULSION_RADIUS = 50;

/** Raw push force at the cursor centre (px/frame²). 30–60 is good.        */
const REPULSION_STRENGTH = 50;

/** 0–1 spring stiffness pulling dots back home. 0.04–0.10 snappy.         */
const SPRING_K = 0.02;

/** 0–1 velocity retained each frame. 0.10–0.20 → gentle settle.           */
const DAMPING = 0.15;

/** px/frame — speed ceiling so a fast flick can't explode the sim.        */
const MAX_SPEED = 40;

/** px — hard cap on distance from home. Keeps the grid readable.          */
const MAX_OFFSET = 50;

/** px/frame² — gentle idle drift so dots float instead of sitting flat.
 *  0 = no float, 0.02 = subtle, 0.05 = noticeable wobble.                  */
const FLOAT_AMPLITUDE = 0.04;

/** Caps devicePixelRatio on the backing store. 2 ≈ 3 visually at ¼ cost.  */
const DPR_CAP = 2;

/* ============================================================================
 * IMPLEMENTATION
 * ============================================================================
 */

interface Dot {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function DottedBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dots: Dot[] = [];
    let rafId = 0;
    let cssW = 0;
    let cssH = 0;
    let frame = 0; // frame counter for float animation

    // Cursor position in canvas-local CSS pixels.
    // -- clientX / clientY are viewport-relative.
    // -- The canvas is at viewport (0,0) with position:fixed, so its
    //    bounding-rect left/top are always 0.  We still subtract rect.left
    //    and rect.top as a safety net (same pattern the Card uses).
    let mouseX = Number.NEGATIVE_INFINITY;
    let mouseY = Number.NEGATIVE_INFINITY;

    const canRepel =
      window.matchMedia("(hover: hover)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- build ---------------------------------------------------------- */

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

      // SINGLE source of truth for dimensions.
      // documentElement.clientWidth excludes the scrollbar (unlike
      // window.innerWidth) and matches the layout viewport used by
      // position:fixed — so CSS size == buffer / dpr with zero drift.
      cssW = document.documentElement.clientWidth;
      cssH = document.documentElement.clientHeight;

      // 1) Explicitly set the canvas CSS size (do NOT rely on inset:0).
      canvas!.style.width = cssW + "px";
      canvas!.style.height = cssH + "px";

      // 2) Size the backing store to the CSS size × dpr.
      canvas!.width = Math.round(cssW * dpr);
      canvas!.height = Math.round(cssH * dpr);

      // 3) Scale the drawing context so we draw in CSS pixels.
      //    Now canvas.width / cssW === dpr exactly (no rounding drift
      //    from different measurement sources).
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Build the dot grid.
      dots = [];
      for (let x = -DOT_GAP; x <= cssW + DOT_GAP; x += DOT_GAP) {
        for (let y = -DOT_GAP; y <= cssH + DOT_GAP; y += DOT_GAP) {
          dots.push({ homeX: x, homeY: y, x, y, vx: 0, vy: 0 });
        }
      }
    }

    /* ---- animation loop ------------------------------------------------- */

    function step() {
      ctx!.clearRect(0, 0, cssW, cssH);
      ctx!.fillStyle = DOT_COLOR;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];

        // 1) Repulsion — push away from cursor.
        const dx = d.x - mouseX;
        const dy = d.y - mouseY;
        const distSq = dx * dx + dy * dy;
        const rSq = REPULSION_RADIUS * REPULSION_RADIUS;
        if (distSq > 1e-4 && distSq < rSq) {
          const dist = Math.sqrt(distSq);
          const falloff = 1 - dist / REPULSION_RADIUS;
          const force = REPULSION_STRENGTH * falloff * falloff;
          d.vx += (dx / dist) * force;
          d.vy += (dy / dist) * force;
        }

        // 2) Spring toward home.
        d.vx += (d.homeX - d.x) * SPRING_K;
        d.vy += (d.homeY - d.y) * SPRING_K;

        // 3) Float — gentle idle drift so dots don't sit flat.
        //    Each dot has a unique phase offset so neighbours drift
        //    independently, creating an organic micro-motion.
        const t = frame * 0.008;
        const phase = i * 2.399;
        d.vx += Math.sin(t * 1.3 + phase) * FLOAT_AMPLITUDE;
        d.vy += Math.cos(t * 1.7 + phase) * FLOAT_AMPLITUDE;

        // 4) Damp velocity.
        d.vx *= 1 - DAMPING;
        d.vy *= 1 - DAMPING;

        // 5) Speed clamp.
        const speed = Math.hypot(d.vx, d.vy);
        if (speed > MAX_SPEED) {
          d.vx = (d.vx / speed) * MAX_SPEED;
          d.vy = (d.vy / speed) * MAX_SPEED;
        }

        // 6) Integrate position.
        d.x += d.vx;
        d.y += d.vy;

        // 7) Offset clamp.
        const ox = d.x - d.homeX;
        const oy = d.y - d.homeY;
        const offset = Math.hypot(ox, oy);
        if (offset > MAX_OFFSET) {
          const s = MAX_OFFSET / offset;
          d.x = d.homeX + ox * s;
          d.y = d.homeY + oy * s;
        }

        ctx!.fillRect(d.x, d.y, DOT_SIZE, DOT_SIZE);
      }

      frame++;
      rafId = requestAnimationFrame(step);
    }

    /* ---- static draw ---------------------------------------------------- */

    function drawStatic() {
      ctx!.clearRect(0, 0, cssW, cssH);
      ctx!.fillStyle = DOT_COLOR;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        ctx!.fillRect(d.x, d.y, DOT_SIZE, DOT_SIZE);
      }
    }

    /* ---- event handlers ------------------------------------------------- */

    function onMouseMove(e: MouseEvent) {
      // Convert viewport coords → canvas-local coords.
      // rect.left/top should be 0 (the canvas is position:fixed at 0,0),
      // but we subtract them anyway as a safety net (same as Card.tsx).
      const r = canvas!.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    }

    function resetCursor() {
      mouseX = Number.NEGATIVE_INFINITY;
      mouseY = Number.NEGATIVE_INFINITY;
    }

    function onMouseOut(e: MouseEvent) {
      if (!e.relatedTarget) resetCursor();
    }

    /* ---- bootstrap ------------------------------------------------------ */

    build();
    if (canRepel) {
      step();
    } else {
      drawStatic();
    }

    window.addEventListener("resize", build);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("blur", resetCursor);
    document.documentElement.addEventListener("mouseout", onMouseOut);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", build);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("blur", resetCursor);
      document.documentElement.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -10,
        pointerEvents: "none",
      }}
    />
  );
}
