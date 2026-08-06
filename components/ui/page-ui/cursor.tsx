"use client";

import { useEffect, useRef } from "react";

/**
 * CustomCursor — ink-bleed cursor with splatter particles and organic trail.
 *
 * Renders a full-viewport canvas (pointer-events: none) that draws:
 *   1. An irregular ink blob (not a perfect circle) that eases toward the cursor.
 *   2. Ink-splatter particles that burst from the blob and fade.
 *   3. A bleeding trail — rough-edged, with halo, like wet ink on paper.
 *
 * On touch devices or when the user prefers reduced motion the canvas is
 * hidden and the native cursor is retained.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                        TUNABLE  PARAMETERS                               ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  INK_BASE_RADIUS       px — core blob radius (idle & hover).           ║
 * ║  INK_HOVER_ALPHA       opacity multiplier when over interactive.        ║
 * ║                         < 1 = translucent, 1 = normal.                  ║
 * ║  INK_PRESS_RADIUS      px — core blob radius while dragging.            ║
 * ║  CLICK_RIPPLE_RADIUS   px — max radius of the click ripple ring.        ║
 * ║  CLICK_RIPPLE_LIFE     frames the ripple expands and fades.             ║
 * ║  CLICK_BURST_COUNT     particles spawned on a single click.             ║
 * ║  CLICK_BURST_SPEED     speed multiplier for click burst particles.      ║
 * ║  INK_BLEED             px — max distance the irregular edge extends.    ║
 * ║  INK_HALO_RADIUS       px — extra radius of the faint bleed halo.       ║
 * ║  INK_WOBBLE_SPEED      how fast the blob shape changes (0 = static).    ║
 * ║  INK_POINTS            number of vertices around the blob perimeter.    ║
 * ║  CURSOR_EASE           0–1 — lerp factor per frame toward mouse.        ║
 * ║  SPAWN_PER_FRAME       splatter particles emitted per frame at idle.    ║
 * ║  SPAWN_PER_FRAME_HOVER particles/frame over interactive elements.       ║
 * ║  SPAWN_PER_FRAME_PRESS particles/frame while dragging.                  ║
 * ║  SPLATTER_SPEED        px/frame — how fast splatter flies outward.      ║
 * ║  SPLATTER_LIFE         frames a splatter particle lives.                ║
 * ║  MAX_SPLATTER          hard cap on live splatter particles.             ║
 * ║  TRAIL_LENGTH_IDLE     past positions kept when idle.                   ║
 * ║  TRAIL_LENGTH_DRAG     past positions kept when dragging.               ║
 * ║  TRAIL_CORE_WIDTH      px — core line width at the cursor.              ║
 * ║  TRAIL_HALO_WIDTH      px — bleed halo width around the core trail.     ║
 * ║  TRAIL_JITTER          px — max random displacement of trail edge.      ║
 * ║  DPR_CAP               Caps devicePixelRatio for the backing store.      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

/* ─── Ink blob ─── */
const INK_BASE_RADIUS = 3.5;
const INK_HOVER_ALPHA = 0.6; // opacity multiplier when over interactive (0–1)
const INK_PRESS_RADIUS = 3;
const CLICK_RIPPLE_RADIUS = 28;
const CLICK_RIPPLE_LIFE = 18;
const CLICK_BURST_COUNT = 7;
const CLICK_BURST_SPEED = 2.0;
const INK_BLEED = 1.8;
const INK_HALO_RADIUS = 4;
const INK_WOBBLE_SPEED = 0.04;
const INK_POINTS = 14;
const CURSOR_EASE = 0.35;

/* ─── Splatter particles ─── */
const SPAWN_PER_FRAME = 0.4;
const SPAWN_PER_FRAME_PRESS = 2;
const SPLATTER_SPEED = 0.6;
const SPLATTER_LIFE = 25;
const MAX_SPLATTER = 120;

/* ─── Trail ─── */
const TRAIL_LENGTH_IDLE = 8;
const TRAIL_LENGTH_DRAG = 40;
const TRAIL_CORE_WIDTH = 2;
const TRAIL_HALO_WIDTH = 6;
const TRAIL_JITTER = 1.2; // px of edge roughness

/* ─── Canvas ─── */
const DPR_CAP = 2;

/** Palette — same as FloatingTextBtn (Seminars section). */
const PALETTE = [
  "#E0FF7C", "#FF7C7C", "#CB7CFF", "#7CFF8E",
  "#FFB87C", "#7CCBFF", "#FF7CE0",
];
/** Frames between palette colour changes while hovering. */
const HOVER_COLOR_CYCLE = 90; // ~1.5 s at 60 fps

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/** Selector for "this element is interactive" hover detection. */
const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, [role='button'], [role='link'], [role='menuitem'], summary";

/* ─── Types ─── */

interface Splatter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  colorIdx: number; // palette index so each particle keeps its colour
}

interface TrailRing {
  buf: { x: number; y: number }[];
  head: number;
  count: number;
}

interface Ripple {
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

/* ─── Simple smooth noise: returns -1..1 for a given frame + index ─── */

function noise(frame: number, idx: number, speed: number): number {
  const t = frame * speed;
  return Math.sin(t * 1.3 + idx * 2.399) * Math.cos(t * 0.7 + idx * 3.117);
}

/* ─── Trail ring helpers ─── */

function trailPush(ring: TrailRing, x: number, y: number) {
  ring.buf[ring.head] = { x, y };
  ring.head = (ring.head + 1) % ring.buf.length;
  if (ring.count < ring.buf.length) ring.count++;
}

/** Iterate trail from oldest → newest, yielding (point, t01). */
function* trailIter(
  ring: TrailRing,
): Generator<[{ x: number; y: number }, number]> {
  if (ring.count < 2) return;
  const start =
    ring.count < ring.buf.length ? 0 : ring.head;
  for (let i = 0; i < ring.count; i++) {
    const idx = (start + i) % ring.buf.length;
    yield [ring.buf[idx], i / (ring.count - 1)];
  }
}

/* ─── Component ─── */

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ---- capability gate ---- */
    const canRun =
      window.matchMedia("(hover: hover)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canRun) {
      canvas.style.display = "none";
      return;
    }

    /* ---- state ---- */
    let splatters: Splatter[] = [];
    let ripples: Ripple[] = [];
    let mouseX = Number.NEGATIVE_INFINITY;
    let mouseY = Number.NEGATIVE_INFINITY;
    let cursorX = Number.NEGATIVE_INFINITY;
    let cursorY = Number.NEGATIVE_INFINITY;
    let isDown = false;
    let hoveringInteractive = false;
    let hasMoved = false;

    const idleTrail: TrailRing = {
      buf: new Array(TRAIL_LENGTH_IDLE),
      head: 0,
      count: 0,
    };
    const dragTrail: TrailRing = {
      buf: new Array(TRAIL_LENGTH_DRAG),
      head: 0,
      count: 0,
    };

    let rafId = 0;
    let cssW = 0;
    let cssH = 0;
    let frame = 0; // animation frame counter for noise
    let spawnAccum = 0;

    /* ---- canvas sizing ---- */

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      cssW = document.documentElement.clientWidth;
      cssH = document.documentElement.clientHeight;
      canvas!.style.width = cssW + "px";
      canvas!.style.height = cssH + "px";
      canvas!.width = Math.round(cssW * dpr);
      canvas!.height = Math.round(cssH * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* ---- splatter spawn ---- */

    function spawnSplatter() {
      if (splatters.length >= MAX_SPLATTER) splatters.shift();

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * INK_BLEED * 0.8;
      const speed = SPLATTER_SPEED * (0.4 + Math.random() * 0.6);

      splatters.push({
        x: cursorX + Math.cos(angle) * dist,
        y: cursorY + Math.sin(angle) * dist,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: SPLATTER_LIFE,
        size: 0.8 + Math.random() * 1.8,
        colorIdx: Math.floor(Math.random() * PALETTE.length),
      });
    }

    /* ---- click ripple + burst ---- */

    function spawnClickEffect(x: number, y: number) {
      // Ripple ring
      ripples.push({ x, y, life: CLICK_RIPPLE_LIFE, maxLife: CLICK_RIPPLE_LIFE });

      // Burst of faster particles
      for (let i = 0; i < CLICK_BURST_COUNT; i++) {
        if (splatters.length >= MAX_SPLATTER) splatters.shift();
        const angle = (i / CLICK_BURST_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const speed = CLICK_BURST_SPEED * (0.6 + Math.random() * 0.8);
        splatters.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: SPLATTER_LIFE * 1.6,
          size: 1.0 + Math.random() * 2.2,
          colorIdx: Math.floor(Math.random() * PALETTE.length),
        });
      }
    }

    /* ---- draw the irregular ink blob ---- */

    function drawInkBlob(
      x: number, y: number, baseRadius: number, alphaMul = 1,
      color?: [number, number, number],
    ) {
      const [cr, cg, cb] = color ?? [0, 0, 0];
      // -- Halo: larger, faint, very irregular --
      const haloRadius = baseRadius + INK_HALO_RADIUS;
      ctx!.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${(0.08 * alphaMul).toFixed(3)})`;
      ctx!.beginPath();
      for (let i = 0; i < INK_POINTS; i++) {
        const angle = (i / INK_POINTS) * Math.PI * 2;
        const n = noise(frame, i, INK_WOBBLE_SPEED);
        const r = haloRadius + n * INK_BLEED * 1.5;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (i === 0) ctx!.moveTo(px, py);
        else ctx!.lineTo(px, py);
      }
      ctx!.closePath();
      ctx!.fill();

      // -- Mid layer: semi-transparent bleed --
      const midRadius = baseRadius + INK_BLEED * 0.5;
      ctx!.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${(0.35 * alphaMul).toFixed(3)})`;
      ctx!.beginPath();
      for (let i = 0; i < INK_POINTS; i++) {
        const angle = (i / INK_POINTS) * Math.PI * 2;
        const n = noise(frame, i + 7, INK_WOBBLE_SPEED * 1.2);
        const r = midRadius + n * INK_BLEED;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (i === 0) ctx!.moveTo(px, py);
        else ctx!.lineTo(px, py);
      }
      ctx!.closePath();
      ctx!.fill();

      // -- Core: small, dark, slightly irregular --
      ctx!.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${(0.9 * alphaMul).toFixed(3)})`;
      ctx!.beginPath();
      for (let i = 0; i < INK_POINTS; i++) {
        const angle = (i / INK_POINTS) * Math.PI * 2;
        const n = noise(frame, i + 14, INK_WOBBLE_SPEED * 1.5);
        const r = baseRadius + n * INK_BLEED * 0.4;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (i === 0) ctx!.moveTo(px, py);
        else ctx!.lineTo(px, py);
      }
      ctx!.closePath();
      ctx!.fill();
      // When translucent (hovering), stroke the core outline so the edge stays visible.
      if (alphaMul < 1) {
        ctx!.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${(0.7).toFixed(3)})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
      }
    }

    /* ---- draw bleeding trail ---- */

    function drawInkBleedTrail(ring: TrailRing, maxAlpha: number) {
      if (ring.count < 2) return;

      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";

      // Collect points with jitter.
      const pts: { x: number; y: number; t01: number }[] = [];
      let idx = 0;
      for (const [p, t01] of trailIter(ring)) {
        const jx = noise(frame, idx * 3, 0.06) * TRAIL_JITTER * (1 - t01);
        const jy = noise(frame, idx * 3 + 10, 0.06) * TRAIL_JITTER * (1 - t01);
        pts.push({ x: p.x + jx, y: p.y + jy, t01 });
        idx++;
      }

      // Pass 1: wide bleed halo.
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const alpha = maxAlpha * 0.12 * (0.2 + 0.8 * b.t01);
        const width = TRAIL_HALO_WIDTH * (0.3 + 0.7 * b.t01);

        ctx!.strokeStyle = `rgba(0, 0, 0, ${alpha.toFixed(3)})`;
        ctx!.lineWidth = width;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      }

      // Pass 2: mid bleed.
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const alpha = maxAlpha * 0.3 * (0.2 + 0.8 * b.t01);
        const midW = (TRAIL_CORE_WIDTH + TRAIL_HALO_WIDTH) / 2;
        const width = midW * (0.4 + 0.6 * b.t01);

        ctx!.strokeStyle = `rgba(0, 0, 0, ${alpha.toFixed(3)})`;
        ctx!.lineWidth = width;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      }

      // Pass 3: core line.
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const alpha = maxAlpha * 0.7 * (0.15 + 0.85 * b.t01);
        const width = TRAIL_CORE_WIDTH * (0.4 + 0.6 * b.t01);

        ctx!.strokeStyle = `rgba(0, 0, 0, ${alpha.toFixed(3)})`;
        ctx!.lineWidth = width;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      }
    }

    /* ---- animation loop ---- */

    function step(_now: number) {
      ctx!.clearRect(0, 0, cssW, cssH);

      // 1) Ease cursor.
      if (hasMoved) {
        cursorX += (mouseX - cursorX) * CURSOR_EASE;
        cursorY += (mouseY - cursorY) * CURSOR_EASE;

        trailPush(idleTrail, cursorX, cursorY);
        if (isDown) {
          trailPush(dragTrail, cursorX, cursorY);
        }
      }

      // 2) Spawn splatter.
      const rate = isDown ? SPAWN_PER_FRAME_PRESS : SPAWN_PER_FRAME;

      spawnAccum += rate;
      while (spawnAccum >= 1 && hasMoved) {
        spawnAccum -= 1;
        spawnSplatter();
      }

      // 3) Trail (under blob). Skip idle trail when hovering — particles are the visual.
      if (isDown) {
        drawInkBleedTrail(dragTrail, 1.0);
      } else if (!hoveringInteractive) {
        drawInkBleedTrail(idleTrail, 0.5);
      }

      // 4) Update & draw click ripples (under blob).
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.life -= 1;
        if (r.life <= 0) {
          ripples[i] = ripples[ripples.length - 1];
          ripples.pop();
          continue;
        }
        const t = r.life / r.maxLife;
        const radius = CLICK_RIPPLE_RADIUS * (1 - t);
        const alpha = t * 0.45;

        // Organic wobbly ring — matches the ink blob aesthetic.
        ctx!.strokeStyle = `rgba(0, 0, 0, ${alpha.toFixed(3)})`;
        ctx!.lineWidth = 1.2 * (0.3 + 0.7 * t);
        ctx!.beginPath();
        for (let j = 0; j < INK_POINTS; j++) {
          const angle = (j / INK_POINTS) * Math.PI * 2;
          const n = noise(frame, j + 20, INK_WOBBLE_SPEED * 1.3);
          const rr = radius + n * INK_BLEED * 0.8;
          const px = r.x + Math.cos(angle) * rr;
          const py = r.y + Math.sin(angle) * rr;
          if (j === 0) ctx!.moveTo(px, py);
          else ctx!.lineTo(px, py);
        }
        ctx!.closePath();
        ctx!.stroke();
      }

      // 5) Draw ink blob.
      if (hasMoved) {
        const radius = isDown ? INK_PRESS_RADIUS : INK_BASE_RADIUS;
        const alphaMul = hoveringInteractive ? INK_HOVER_ALPHA : 1;
        const hoverColor: [number, number, number] | undefined = hoveringInteractive
          ? hexToRgb(PALETTE[Math.floor(frame / HOVER_COLOR_CYCLE) % PALETTE.length])
          : undefined;
        drawInkBlob(cursorX, cursorY, radius, alphaMul, hoverColor);
      }

      // 6) Update & draw splatters (on top of blob for depth).
      for (let i = splatters.length - 1; i >= 0; i--) {
        const s = splatters[i];
        s.life -= 1;
        if (s.life <= 0) {
          splatters[i] = splatters[splatters.length - 1];
          splatters.pop();
          continue;
        }

        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.97;
        s.vy *= 0.97;

        const t = s.life / SPLATTER_LIFE;
        const baseAlpha = t * t * 0.6;
        const size = s.size * (0.3 + 0.7 * t);

        if (hoveringInteractive) {
          // Translucent fill + coloured outline — each particle keeps its own palette colour.
          const [pr, pg, pb] = hexToRgb(PALETTE[s.colorIdx % PALETTE.length]);
          ctx!.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${(baseAlpha * INK_HOVER_ALPHA).toFixed(3)})`;
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, size, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, ${(baseAlpha * 0.8).toFixed(3)})`;
          ctx!.lineWidth = 0.5;
          ctx!.stroke();
        } else {
          ctx!.fillStyle = `rgba(0, 0, 0, ${baseAlpha.toFixed(3)})`;
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, size, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      frame++;
      rafId = requestAnimationFrame(step);
    }

    /* ---- event handlers ---- */

    function onPointerMove(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;

      if (!hasMoved) {
        hasMoved = true;
        cursorX = mouseX;
        cursorY = mouseY;
      }

      const el = document.elementFromPoint(e.clientX, e.clientY);
      hoveringInteractive = el
        ? el.closest(INTERACTIVE_SELECTOR) !== null
        : false;

      isDown = (e.buttons & 1) !== 0;
      if (!isDown) {
        dragTrail.count = 0;
        dragTrail.head = 0;
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      isDown = true;
      dragTrail.count = 0;
      dragTrail.head = 0;
      spawnClickEffect(cursorX, cursorY);
    }

    function onPointerUp() {
      isDown = false;
      dragTrail.count = 0;
      dragTrail.head = 0;
    }

    function resetCursor() {
      hasMoved = false;
      isDown = false;
      idleTrail.count = 0;
      idleTrail.head = 0;
      dragTrail.count = 0;
      dragTrail.head = 0;
      mouseX = Number.NEGATIVE_INFINITY;
      mouseY = Number.NEGATIVE_INFINITY;
    }

    function onMouseOut(e: MouseEvent) {
      if (!e.relatedTarget) resetCursor();
    }

    /* ---- init ---- */

    build();
    window.addEventListener("resize", build);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("blur", resetCursor);
    document.documentElement.addEventListener("mouseout", onMouseOut);

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", build);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
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
        zIndex: 10000,
        pointerEvents: "none",
      }}
    />
  );
}
