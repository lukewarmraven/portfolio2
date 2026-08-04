"use client"

import { useState, useCallback, useRef, useEffect } from "react";
import { vw } from "@/lib/utils";

export interface PopupCarouselItem {
  image: string;
  title: string;
  description: string;
}

interface PopupCarouselProps {
  items: PopupCarouselItem[];
  className?: string;
}

/** Horizontal spread (design px) between adjacent items in the bottom pile. */
const SPREAD_X = 36;
/** Wheel debounce in ms — prevents rapid-fire scrolling. */
const WHEEL_DEBOUNCE = 500;

export default function PopupCarousel({ items, className }: PopupCarouselProps) {
  const total = items.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(currentIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canNavigate = useRef(true);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(total - 1, index));
      currentIndexRef.current = clamped;
      setCurrentIndex(clamped);
    },
    [total],
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
      setCurrentIndex((prev) => {
        const next = prev + dir;
        const clamped = Math.max(0, Math.min(total - 1, next));
        currentIndexRef.current = clamped;
        return clamped;
      });
    },
    [total],
  );

  // ── Native wheel listener — blocks scroll only when navigation is possible ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      const next = currentIndexRef.current + dir;

      // Only block the scroll if we can actually navigate in that direction.
      // At boundaries (start scrolling up, end scrolling down), let the event
      // pass through so RightMain can take over.
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

  /** z-index: current on top, prev items front of pile, next items behind in pile. */
  const getZIndex = (offset: number) => {
    if (offset === 0) return total + 1;
    if (offset < 0) return total + offset; // -1→total-1, -2→total-2 (front of pile)
    return total - offset - total; // +1→0, +2→1 (back of pile, behind)
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

        // Current: elevated; Non-current: bottom pile, spread horizontally
        const top = isCurrent ? "10%" : "87%";
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
                height: isCurrent ? vw(540) : "auto",
                width: isCurrent ? "auto" : "100%",
                maxWidth: isCurrent ? "none" : "100%",
                borderRadius: vw(16),
                boxShadow: isCurrent
                  ? "0 8px 48px rgba(0,0,0,0.18)"
                  : "0 1px 8px rgba(0,0,0,0.1)",
                transition: "box-shadow 0.55s ease",
              }}
            />
            {/* Text overlay — only on current */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: vw(24),
                paddingTop: vw(56),
                background:
                  "linear-gradient(transparent, rgba(0,0,0,0.7) 40%)",
                borderRadius: `0 0 ${vw(16)} ${vw(16)}`,
                opacity: isCurrent ? 1 : 0,
                transition: "opacity 0.35s ease",
                pointerEvents: "none",
              }}
            >
              <h3
                className="font-league-gothic m-0"
                style={{ fontSize: vw(32), color: "#fff" }}
              >
                {item.title}
              </h3>
              <p
                className="font-rajdhani m-0"
                style={{
                  fontSize: vw(18),
                  color: "rgba(255,255,255,0.8)",
                  marginTop: vw(4),
                }}
              >
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
