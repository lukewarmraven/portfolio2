"use client"

import { useCallback, useRef, useEffect } from "react";
import { vw } from "@/lib/utils";

export interface PopupCarouselItem {
  image: string;
  title: string;
  description: string;
}

interface PopupCarouselProps {
  items: PopupCarouselItem[];
  currentIndex: number;
  onCurrentChange: (index: number) => void;
  className?: string;
}

/** Horizontal spread (design px) between adjacent items in the bottom pile. */
const SPREAD_X = 36;
/** Wheel debounce in ms — prevents rapid-fire scrolling. */
const WHEEL_DEBOUNCE = 500;

export default function PopupCarousel({
  items,
  currentIndex,
  onCurrentChange,
  className,
}: PopupCarouselProps) {
  const total = items.length;
  const currentRef = useRef(currentIndex);
  currentRef.current = currentIndex;
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canNavigate = useRef(true);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(total - 1, index));
      onCurrentChange(clamped);
    },
    [total, onCurrentChange],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!canNavigate.current) return;
      canNavigate.current = false;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        canNavigate.current = true;
        debounceTimer.current = null;
      }, WHEEL_DEBOUNCE);
      const next = currentRef.current + dir;
      const clamped = Math.max(0, Math.min(total - 1, next));
      onCurrentChange(clamped);
    },
    [total, onCurrentChange],
  );

  // ── Native wheel listener — blocks scroll only when navigation is possible ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      const next = currentRef.current + dir;

      if (next >= 0 && next < total) {
        e.preventDefault();
        e.stopPropagation();
        step(dir);
      }
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [step, total]);

  const handleClick = useCallback(
    (index: number) => {
      if (index !== currentIndex) goTo(index);
    },
    [currentIndex, goTo],
  );

  const getZIndex = (offset: number) => {
    if (offset === 0) return total + 1;
    if (offset < 0) return total + offset;
    return total - offset - total;
  };

  const getOpacity = (offset: number) => {
    if (offset === 0) return 1;
    return Math.max(0.25, 1 - Math.abs(offset) * 0.4);
  };

  if (total === 0) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        flex: "1 1 0",
        minHeight: 0,
        cursor: "grab",
      }}
    >
      {items.map((item, i) => {
        const offset = i - currentIndex;
        const isCurrent = offset === 0;

        const top = isCurrent ? "10%" : "78%";
        const left = isCurrent
          ? "50%"
          : `calc(50% + ${vw(offset * SPREAD_X)})`;
        const scale = isCurrent ? 1 : 0.84;

        return (
          <div
            key={i}
            onClick={() => handleClick(i)}
            style={{
              position: "absolute",
              top,
              left,
              width: isCurrent ? "auto" : vw(460),
              transform: `translateX(-50%) scale(${scale})`,
              zIndex: getZIndex(offset),
              opacity: getOpacity(offset),
              transition:
                "top 0.55s cubic-bezier(0.16, 1, 0.3, 1), left 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.55s ease",
              cursor: isCurrent ? "default" : "pointer",
            }}
            role="button"
            tabIndex={isCurrent ? -1 : 0}
            aria-label={item.title}
          >
            <img
              src={item.image}
              alt={item.title}
              draggable={false}
              style={{
                display: "block",
                height: isCurrent ? vw(450) : "auto",
                width: isCurrent ? "auto" : "100%",
                maxWidth: isCurrent ? "none" : "100%",
                borderRadius: vw(16),
                boxShadow: isCurrent
                  ? "0 4px 24px rgba(0,0,0,0.25), 0 12px 48px rgba(0,0,0,0.15)"
                  : "0 2px 8px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
                transition: "box-shadow 0.55s ease",
              }}
            />
          </div>
        );
      })}

      {/* ── Scroll indicator ── */}
      {total > 1 && (
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
            background:
              "linear-gradient(transparent, var(--color-card, #fff) 60%)",
            pointerEvents: "none",
            zIndex: total + 2,
          }}
        >
          <span
            className="font-rajdhani text-muted-foreground"
            style={{ fontSize: vw(32), position: "relative", top: 20 }}
          >
            {currentIndex < total - 1
              ? "-- Scroll for more --"
              : "— End —"}
          </span>
        </div>
      )}
    </div>
  );
}
