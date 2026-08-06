"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn, vw } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_MAX_TILT = 12;
const DEFAULT_PERSPECTIVE = 1200;
const DEFAULT_FLIP_MS = 650;
const GLOSS_SIZE_PX = 90;
const GLOSS_COLOR = "rgba(255,255,255,0.5)";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

export interface CallingCardProps {
  /** Front-face content. */
  front: ReactNode;
  /** Back-face content. */
  back: ReactNode;
  /** Max tilt angle in degrees. Default: 12. */
  maxTilt?: number;
  /** CSS perspective distance in design px — scaled via vw(). Default: 1200. */
  perspective?: number;
  /** Flip transition duration in ms. Default: 650. */
  flipMs?: number;
  /** Set false to disable click-to-flip. Default: true. */
  flipEnabled?: boolean;
  /** Set false to disable the hover tilt effect. Default: true. */
  tiltEnabled?: boolean;
  /** Set false to disable the reflective gloss overlay. Default: true. */
  glossEnabled?: boolean;
  /** Controlled flipped state — wins over internal state when provided. */
  flipped?: boolean;
  /** Initial flipped state (uncontrolled). Default: false. */
  defaultFlipped?: boolean;
  /** Fires on every flip with the new state. */
  onFlipChange?: (flipped: boolean) => void;
  /** Enable hover preview (portals card to body with deeper shadow). Default: false. */
  previewEnabled?: boolean;
  /** Hover delay before preview opens in ms. Default: 2000. */
  previewDelay?: number;
  /** High-res image for preview when front face is visible. Falls back to rendering front ReactNode. */
  previewFrontSrc?: string;
  /** High-res image for preview when back face is visible. Falls back to rendering back ReactNode. */
  previewBackSrc?: string;
  className?: string;
  style?: CSSProperties;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function CallingCard({
  front,
  back,
  maxTilt = DEFAULT_MAX_TILT,
  perspective = DEFAULT_PERSPECTIVE,
  flipMs = DEFAULT_FLIP_MS,
  flipEnabled = true,
  tiltEnabled = true,
  glossEnabled = true,
  flipped: controlledFlipped,
  defaultFlipped = false,
  onFlipChange,
  previewEnabled = false,
  previewDelay = 2000,
  previewFrontSrc,
  previewBackSrc,
  className,
  style,
}: CallingCardProps) {
  /* ---- state ----------------------------------------------------- */

  const [internalFlipped, setInternalFlipped] = useState(defaultFlipped);
  const isFlipped = controlledFlipped ?? internalFlipped;

  /* ---- refs ------------------------------------------------------ */

  const cardRef = useRef<HTMLDivElement>(null);
  const tiltLayerRef = useRef<HTMLDivElement>(null);
  const flipLockRef = useRef(false);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null);
  const hoverCapableRef = useRef(true);
  const reducedMotionRef = useRef(false);

  /* ---- capability detection (run once on mount) ------------------ */

  useEffect(() => {
    hoverCapableRef.current = window.matchMedia("(hover: hover)").matches;
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  /* ---- flip timer cleanup on unmount ----------------------------- */

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, []);

  /* ---- start flip ------------------------------------------------ */

  const startFlip = useCallback(() => {
    if (!flipEnabled || flipLockRef.current) return;

    flipLockRef.current = true;
    const next = !isFlipped;
    setInternalFlipped(next);
    onFlipChange?.(next);

    // Timer-based lock — more reliable than transitionend
    flipTimerRef.current = setTimeout(() => {
      flipLockRef.current = false;
      flipTimerRef.current = null;
    }, flipMs);
  }, [flipEnabled, isFlipped, onFlipChange, flipMs]);

  /* ---- click handler (with inner-interactive guard) -------------- */

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // Don't flip if the click landed on an interactive child
      if (
        (e.target as HTMLElement).closest(
          "a, button, input, textarea, select, [role='link']",
        )
      )
        return;
      startFlip();
    },
    [startFlip],
  );

  /* ---- keyboard handler ------------------------------------------ */

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!flipEnabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        startFlip();
      }
    },
    [flipEnabled, startFlip],
  );

  /* ---- tilt + gloss handlers (zero re-render DOM writes) --------- */

  const handleMouseEnter = useCallback(() => {
    const el = tiltLayerRef.current;
    if (
      !el ||
      !tiltEnabled ||
      !hoverCapableRef.current ||
      reducedMotionRef.current
    )
      return;
    // Strip transitions for responsive live tracking
    el.style.transition = "none";
    if (cardRef.current) cardRef.current.style.transition = "none";
  }, [tiltEnabled]);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const el = tiltLayerRef.current;
      if (
        !el ||
        !tiltEnabled ||
        !hoverCapableRef.current ||
        reducedMotionRef.current
      )
        return;

      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width; // 0..1
      const ny = (e.clientY - rect.top) / rect.height; // 0..1

      // rx: -1 (top) .. +1 (bottom), ry: -1 (left) .. +1 (right)
      const rx = (ny - 0.5) * 2;
      const ry = (nx - 0.5) * 2;

      el.style.setProperty("--tilt-x", `${(-rx * maxTilt).toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${(ry * maxTilt).toFixed(2)}deg`);

      // Dynamic drop shadow — shifts opposite to tilt
      if (cardRef.current) {
        const shadowDist = Math.sqrt(rx * rx + ry * ry);
        const maxShadow = rect.width * 0.04;
        cardRef.current.style.setProperty("--shadow-x", `${(-ry * maxShadow).toFixed(1)}px`);
        cardRef.current.style.setProperty("--shadow-y", `${(4 + rx * maxShadow).toFixed(1)}px`);
        cardRef.current.style.setProperty("--shadow-blur", vw(4 + shadowDist * 12));
        cardRef.current.style.setProperty("--shadow-alpha", (0.08 + shadowDist * 0.14).toFixed(3));
      }

      if (glossEnabled) {
        const gx = `${e.clientX - rect.left}px`;
        const gy = `${e.clientY - rect.top}px`;
        el.style.setProperty("--gloss-x", gx);
        el.style.setProperty("--gloss-y", gy);
        // Mirrored x for back face (its local x-axis is flipped by rotateY(180deg))
        el.style.setProperty(
          "--gloss-x-back",
          `${rect.width - (e.clientX - rect.left)}px`,
        );
      }
    },
    [maxTilt, tiltEnabled, glossEnabled],
  );

  const handleMouseLeave = useCallback(() => {
    const el = tiltLayerRef.current;
    if (!el) return;

    // Restore transitions for smooth reset to center
    el.style.transition = `transform 500ms ${EASE}`;

    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");

    if (glossEnabled) {
      el.style.setProperty("--gloss-x", "50%");
      el.style.setProperty("--gloss-y", "50%");
      el.style.setProperty("--gloss-x-back", "50%");
    }

    // Reset shadow
    if (cardRef.current) {
      cardRef.current.style.transition = `filter 500ms ${EASE}`;
      cardRef.current.style.setProperty("--shadow-x", "0px");
      cardRef.current.style.setProperty("--shadow-y", vw(4));
      cardRef.current.style.setProperty("--shadow-blur", vw(4));
      cardRef.current.style.setProperty("--shadow-alpha", "0.08");
    }
  }, [glossEnabled]);

  /* ---- hover preview (portal card to body on long hover) --------- */

	  const openPreview = useCallback(() => {
	    if (cardRef.current) {
	      setPreviewRect(cardRef.current.getBoundingClientRect());
	      setPreviewOpen(true);
	    }
	  }, []);

	  const closePreview = useCallback(() => {
	    setPreviewOpen(false);
	    setPreviewRect(null);
	  }, []);

	  const cancelPreviewTimer = useCallback(() => {
	    if (previewTimerRef.current) {
	      clearTimeout(previewTimerRef.current);
	      previewTimerRef.current = null;
	    }
	  }, []);

	  const handlePreviewEnter = useCallback(() => {
	    if (!previewEnabled) return;
	    cancelPreviewTimer();
	    // If preview is already open, keep it alive
	    if (previewOpen) return;
	    previewTimerRef.current = setTimeout(openPreview, previewDelay);
	  }, [previewEnabled, previewDelay, openPreview, cancelPreviewTimer, previewOpen]);

	  // Card leave only cancels the timer — preview stays open
	  const handleCardLeave = useCallback(() => {
	    cancelPreviewTimer();
	  }, [cancelPreviewTimer]);

	  // Preview leave closes it
	  const handlePreviewLeave = useCallback(() => {
	    closePreview();
	  }, [closePreview]);

	  // Cleanup preview timer
	  useEffect(() => {
	    return () => {
	      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
	    };
	  }, []);

	  /* ---- derived values -------------------------------------------- */

  const effectiveFlipMs = reducedMotionRef.current ? 0 : flipMs;
  const isInteractive = flipEnabled;
  const phase = flipLockRef.current
    ? isFlipped
      ? "flipping-back"
      : "flipping"
    : isFlipped
      ? "flipped"
      : "idle";

  /* ---- CSS custom property defaults (on the tilt layer) ---------- */

  const tiltLayerStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    transform: "rotateX(var(--tilt-x)) rotateY(var(--tilt-y))",
    willChange: "transform",
    // Defaults — overridden by JS on hover
    ["--tilt-x" as string]: "0deg",
    ["--tilt-y" as string]: "0deg",
    ["--gloss-x" as string]: "50%",
    ["--gloss-y" as string]: "50%",
    ["--gloss-x-back" as string]: "50%",
  };

  const flipLayerStyle: CSSProperties = {
    transformStyle: "preserve-3d",
    transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
    transition: `transform ${effectiveFlipMs}ms ${EASE}`,
    width: "100%",
    height: "100%",
  };

  const faceStyle: CSSProperties = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    position: "absolute",
    inset: 0,
  };

  const backFaceStyle: CSSProperties = {
    ...faceStyle,
    transform: "rotateY(180deg)",
  };

  const glossOverlayStyle: CSSProperties = {
    background: `radial-gradient(circle ${GLOSS_SIZE_PX}px at var(--gloss-x) var(--gloss-y), ${GLOSS_COLOR}, transparent 70%)`,
  };

  const glossOverlayBackStyle: CSSProperties = {
    background: `radial-gradient(circle ${GLOSS_SIZE_PX}px at var(--gloss-x-back) var(--gloss-y), ${GLOSS_COLOR}, transparent 70%)`,
  };

  /* ---- render ---------------------------------------------------- */

  return (
    <>
    <div
      ref={cardRef}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? isFlipped : undefined}
      data-phase={phase}
      data-flipped={isFlipped ? "" : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => { handleMouseEnter(); handlePreviewEnter(); }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { handleMouseLeave(); handleCardLeave(); }}
      className={cn(
        "group/calling-card relative select-none rounded-4xl",
        isInteractive && "cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "touch-manipulation",
        className,
      )}
      style={{
        perspective: vw(perspective),
        ["--shadow-x" as string]: "0px",
        ["--shadow-y" as string]: vw(4),
        ["--shadow-blur" as string]: vw(4),
        ["--shadow-alpha" as string]: "0.08",
        filter:
          "drop-shadow(var(--shadow-x) var(--shadow-y) var(--shadow-blur) rgba(0,0,0,var(--shadow-alpha)))",
        transition: `filter 500ms ${EASE}`,
        ...style,
      }}
    >
      {/* ── Tilt layer (rotateX/Y driven by cursor) ── */}
      <div ref={tiltLayerRef} style={tiltLayerStyle}>
        {/* ── Flip layer (rotateY(0|180deg) state-driven) ── */}
        <div style={flipLayerStyle}>
          {/* ── Front face ── */}
          <div style={faceStyle} aria-hidden={isFlipped}>
            <div className="h-full w-full rounded-[inherit] border border-border bg-card text-card-foreground font-rajdhani shadow-card">
              {front}
            </div>
            {glossEnabled && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/calling-card:opacity-100"
                style={glossOverlayStyle}
              />
            )}
          </div>

          {/* ── Back face ── */}
          <div style={backFaceStyle} aria-hidden={!isFlipped}>
            <div className="h-full w-full rounded-[inherit] border border-border bg-card text-card-foreground font-rajdhani shadow-card">
              {back}
            </div>
            {glossEnabled && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/calling-card:opacity-100"
                style={glossOverlayBackStyle}
              />
            )}
          </div>
        </div>
      </div>
    </div>

    {/* ── Hover preview (ported to body to escape container clipping) ── */}
    {previewOpen && previewRect &&
      createPortal(
        <div
          onMouseEnter={handlePreviewEnter}
          onMouseLeave={handlePreviewLeave}
          style={{
            position: "fixed",
            left: previewRect.left + previewRect.width / 2,
            top: previewRect.top + previewRect.height / 2,
            width: previewRect.width * 1.4,
            height: previewRect.height * 1.4,
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            borderRadius: vw(12),
            boxShadow:
              "0 8px 48px rgba(0,0,0,0.35), 0 16px 64px rgba(0,0,0,0.2)",
            overflow: "hidden",
          }}
        >
          {(isFlipped ? previewBackSrc : previewFrontSrc) ? (
            <img
              src={isFlipped ? previewBackSrc! : previewFrontSrc!}
              alt=""
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "inherit",
              }}
            />
          ) : (
            <div className="h-full w-full rounded-[inherit] border border-border bg-card text-card-foreground font-rajdhani shadow-card">
              {isFlipped ? back : front}
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
