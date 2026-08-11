"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { cn, vw } from "@/lib/utils";

export interface FloatingTextBtnItem {
  number: string;
  title: string;
  body?: string;
  image?: string;
  images?: string[];
}

interface FloatingTextBtnProps {
  items: FloatingTextBtnItem[];
  page: number;
  onPageChange: (page: number) => void;
  className?: string;
  onItemClick?: (item: FloatingTextBtnItem, index: number) => void;
  pageSize?: number;
}

const PALETTE = [
  "#E0FF7C", "#FF7C7C", "#CB7CFF", "#7CFF8E",
  "#FFB87C", "#7CCBFF", "#FF7CE0",
];

const FLOAT_PRESETS = [
  { name: "fb-up", tx: 0, ty: -1 },
  { name: "fb-right", tx: 1, ty: 0 },
  { name: "fb-down", tx: 0, ty: 1 },
  { name: "fb-left", tx: -1, ty: 0 },
  { name: "fb-tl", tx: -1, ty: -1 },
  { name: "fb-tr", tx: 1, ty: -1 },
  { name: "fb-bl", tx: -1, ty: 1 },
  { name: "fb-br", tx: 1, ty: 1 },
];

const DRIFT = 12;

/** Initial scattered positions per grid slot (col, row) — vw offsets before float begins */
const INIT_OFFSETS = [
  // col 0
  [
    { tx: -14, ty: -10 },
    { tx: 10, ty: 6 },
    { tx: -8, ty: -14 },
    { tx: 16, ty: 8 },
  ],
  // col 1
  [
    { tx: 12, ty: 12 },
    { tx: -8, ty: -8 },
    { tx: 14, ty: 10 },
    { tx: -10, ty: -12 },
  ],
];

export const WHEEL_DEBOUNCE = 600;
const TRANSITION_MS = 550;
const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const PARTICLES_PER_ITEM = 10;

interface Particle {
  id: number;
  burstIdx: number;
  dur: number;
  delay: number;
}

// ── Keyframe generators ──

function floatKF(name: string, tx: number, ty: number): string {
  const dx = (tx * DRIFT).toFixed(0);
  const dy = (ty * DRIFT).toFixed(0);
  return `@keyframes ${name}{0%{transform:translate(0,0)}100%{transform:translate(${dx}px,${dy}px)}}`;
}

function burstKF(i: number): string {
  const rad = (BURST_ANGLES[i] * Math.PI) / 180;
  const dx = (Math.cos(rad) * 60).toFixed(0);
  const dy = (Math.sin(rad) * 60).toFixed(0);
  return `@keyframes burst-${i}{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(${dx}px,${dy}px) scale(0);opacity:0}}`;
}

function popKF(): string {
  return `@keyframes item-pop{0%{transform:scale(1);opacity:1}30%{transform:scale(1.12);opacity:1}100%{transform:scale(1.25);opacity:0}}`;
}

function enterKF(): string {
  return `@keyframes item-enter{0%{transform:scale(0.7);opacity:0}60%{transform:scale(1.04);opacity:1}100%{transform:scale(1);opacity:1}}`;
}

export default function FloatingTextBtn({
  items,
  page,
  onPageChange,
  className,
  onItemClick,
  pageSize = 4,
}: FloatingTextBtnProps) {
  const totalPages = Math.ceil(items.length / pageSize);
  const [displayPage, setDisplayPage] = useState(0);

  const [phase, setPhase] = useState<"idle" | "popping" | "entering">("idle");
  const [particles, setParticles] = useState<Particle[][]>([]);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // ── Trigger transition when page changes ──
  useEffect(() => {
    if (page === displayPage) return;

    if (transitionTimer.current) clearTimeout(transitionTimer.current);

    const oldCount = Math.min(pageSize, items.length - displayPage * pageSize);
    const sets: Particle[][] = [];
    for (let i = 0; i < oldCount; i++) {
      const itemParticles: Particle[] = [];
      for (let j = 0; j < PARTICLES_PER_ITEM; j++) {
        itemParticles.push({
          id: j,
          burstIdx: (i * 3 + j * 7) % BURST_ANGLES.length,
          dur: 0.35 + Math.random() * 0.3,
          delay: Math.random() * 0.12,
        });
      }
      sets.push(itemParticles);
    }

    setParticles(sets);
    setPhase("popping");

    transitionTimer.current = setTimeout(() => {
      setDisplayPage(page);
      setPhase("entering");
      setParticles([]);

      transitionTimer.current = setTimeout(() => {
        setPhase("idle");
      }, 400);
    }, TRANSITION_MS);
  }, [page, displayPage, items.length, pageSize]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, []);

  // ── Styles ──
  const styleTag = useMemo(() => {
    const parts: string[] = [];
    FLOAT_PRESETS.forEach((p) => parts.push(floatKF(p.name, p.tx, p.ty)));
    BURST_ANGLES.forEach((_, i) => parts.push(burstKF(i)));
    parts.push(popKF(), enterKF());
    return parts.join("\n");
  }, []);

  const showItems = items.slice(displayPage * pageSize, (displayPage + 1) * pageSize);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col items-center justify-center", className)}
      style={{ flex: "1 1 0", minHeight: 0, overflow: "hidden" }}
    >
      <style>{styleTag}</style>

      {/* ── Grid ── */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 1fr",
          justifyItems: "center",
          alignItems: "center",
          rowGap: vw(48),
          columnGap: vw(24),
          paddingTop: vw(24),
          paddingBottom: vw(24),
        }}
      >
        {showItems.map((item, i) => {
          const globalIndex = displayPage * pageSize + i;
          const color = PALETTE[globalIndex % PALETTE.length];
          const preset = FLOAT_PRESETS[globalIndex % FLOAT_PRESETS.length];
          const dur = 3.5 + (globalIndex % 4) * 0.8;
          const delay = -(globalIndex * 0.7);

          const col = i % 2;
          const row = Math.floor(i / 2);
          const init = INIT_OFFSETS[col][row % INIT_OFFSETS[col].length];
          const floatAnim = `${preset.name} ${dur}s cubic-bezier(0.45, 0, 0.55, 1) ${delay}s infinite alternate`;

          let transAnim: string | undefined;
          if (phase === "popping") {
            transAnim = `item-pop ${TRANSITION_MS}ms cubic-bezier(0.36, 0, 0.66, 1) forwards`;
          } else if (phase === "entering") {
            transAnim = `item-enter 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;
          }

          return (
            <button
              key={item.number}
              type="button"
              onClick={() => phase === "idle" && onItemClick?.(item, globalIndex)}
              className="relative bg-transparent border-none cursor-pointer"
              style={{ pointerEvents: phase === "idle" ? "auto" : "none" }}
            >
              {/* Initial offset — scatters items before float begins */}
              <span
                className="flex flex-col items-center"
                style={{ transform: `translate(${vw(init.tx)}, ${vw(init.ty)})` }}
              >
              {/* Float layer — always running so pop starts from float position */}
              <span
                className="flex flex-col items-center"
                style={{ animation: floatAnim }}
              >
                {/* Transition layer — pop/enter composes on top of float */}
                <span
                  className="flex flex-col items-center"
                  style={transAnim ? { animation: transAnim } : undefined}
                >
                  <span
                    className="font-rajdhani font-bold leading-[0.9] whitespace-nowrap"
                    style={{
                      fontSize: vw(128),
                      color,
                      WebkitTextStroke: `${vw(20)} #000000`,
                      paintOrder: "stroke fill",
                      filter: `drop-shadow(0 ${vw(15)} ${vw(4)} rgba(0,0,0,0.5))`,
                    }}
                  >
                    {item.number}
                  </span>
                  <span
                    className="font-rajdhani font-bold text-muted-foreground whitespace-nowrap"
                    style={{
                      fontSize: vw(24),
                      filter: `drop-shadow(0 ${vw(15)} ${vw(4)} rgba(0,0,0,0.5))`,
                    }}
                  >
                    {item.title}
                  </span>
                </span>

                {/* Particles — inside float layer so they burst from float position */}
                {phase === "popping" && particles[i] && (
                  <span className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {particles[i].map((p) => (
                      <span
                        key={p.id}
                        style={{
                          position: "absolute",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: color,
                          animation: `burst-${p.burstIdx} ${p.dur}s ease-out ${p.delay}s forwards`,
                          boxShadow: `0 0 6px ${color}`,
                        }}
                      />
                    ))}
                  </span>
                )}
              </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Scroll indicator ── */}
      {totalPages > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            padding: vw(32),
            paddingBottom: vw(32),
            background: "linear-gradient(transparent, var(--color-card, #fff) 60%)",
            pointerEvents: "none",
          }}
        >
          <span
            className="font-rajdhani text-muted-foreground"
            style={{ fontSize: vw(32), position: "relative", top: 20 }}
          >
            {displayPage < totalPages - 1 ? "-- Scroll for more --" : "— End —"}
          </span>
        </div>
      )}
    </div>
  );
}
