"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/theme-context";
import { vw } from "@/lib/utils";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// Fixed mask that fades the corner — scaling the element does the revealing
const PEEK_MASK =
  "linear-gradient(to top left, black 0%, black 18%, transparent 42%)";

const CONTAINER_SIZE = vw(100);
const ICON_SIZE = vw(40);
const ICON_OFFSET = vw(14);

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [hovered, setHovered] = useState(false);

  const isDark = theme === "dark";

  const iconSrc = isDark
    ? "/assets/misc/light-mode.png"
    : "/assets/misc/dark-mode.png";

  const peekColor = isDark ? "#ffffff" : "#111111";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        width: CONTAINER_SIZE,
        height: CONTAINER_SIZE,
        zIndex: 9998,
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      {/* ── Peeking corner (scales from bottom-right on hover) ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: peekColor,
          maskImage: PEEK_MASK,
          WebkitMaskImage: PEEK_MASK,
          transformOrigin: "bottom right",
          transform: hovered ? "scale(1)" : "scale(0.28)",
          transition: `transform 550ms ${EASE}`,
        }}
      />

      {/* ── Icon (always visible, sits above the peek) ── */}
      <img
        src={iconSrc}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          bottom: ICON_OFFSET,
          right: ICON_OFFSET,
          width: ICON_SIZE,
          height: ICON_SIZE,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
