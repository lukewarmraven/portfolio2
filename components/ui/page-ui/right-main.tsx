"use client";

import { useEffect, useRef } from "react";
import { vw } from "@/lib/utils";

export default function RightMain({ children }: { children?: React.ReactNode }) {
  const rightMainRef = useRef<HTMLDivElement>(null);

  // ── Wheel trap: block snap-scroll until internal content boundary ──
  useEffect(() => {
    const el = rightMainRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      // Walk up from target to find any ancestor that contains a scroll container
      let node: HTMLElement | null = e.target as HTMLElement;
      while (node && node !== el) {
        const scrollEl =
          node.querySelector?.<HTMLElement>("[data-scroll-container]");
        if (scrollEl) {
          const { scrollTop, scrollHeight, clientHeight } = scrollEl;
          const atTop = scrollTop <= 0;
          const atBottom = scrollHeight - scrollTop - clientHeight <= 1;
          const scrollingDown = e.deltaY > 0;
          const scrollingUp = e.deltaY < 0;

          if ((scrollingDown && !atBottom) || (scrollingUp && !atTop)) {
            e.preventDefault();
            e.stopPropagation();
            scrollEl.scrollTop += e.deltaY;
          }
          return; // Found a section with scroll — handled
        }
        node = node.parentElement;
      }
      // No scroll container found → let right-main snap-scroll naturally
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div
      ref={rightMainRef}
      data-right-main
      className="no-scrollbar"
      style={{
        width: vw(635),
        height: "100%",
        overflowY: "auto",
        scrollSnapType: "y mandatory",
      }}
    >
      {children}
    </div>
  );
}
