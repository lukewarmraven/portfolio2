"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { vw } from "@/lib/utils";
import SkillsPhysics from "@/components/ui/reusable-ui/skills-physics";
import LastfmStats from "@/components/ui/home-ui/LastfmStats";
import GithubGrid from "@/components/ui/home-ui/GithubGrid";
import VersionSwitcher from "@/components/ui/home-ui/version-switcher";

const SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Tailwind",
  "Figma",
  "AWS",
];

export default function HomePage() {
  const [hoveredVersion, setHoveredVersion] = useState<number | null>(null);

  // Scroll arrows
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * dir, behavior: "smooth" });
  };

  return (
    <section
      className="flex flex-col"
      style={{ height: "100%", gap: vw(16) }}
    >
      <h1
        className="font-league-gothic m-0"
        style={{ fontSize: vw(64) }}
      >
        HOME
      </h1>

      <div style={{ position: "relative", flex: "1 1 0", minHeight: 0 }}>
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollBy(-1)}
            className="font-league-gothic"
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "rgba(255,255,255,0.85)",
              border: "1px solid var(--color-border)",
              borderRadius: "50%",
              width: vw(72),
              height: vw(72),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: vw(48),
              color: "var(--color-foreground)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            ‹
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollBy(1)}
            className="font-league-gothic"
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "rgba(255,255,255,0.85)",
              border: "1px solid var(--color-border)",
              borderRadius: "50%",
              width: vw(72),
              height: vw(72),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: vw(48),
              color: "var(--color-foreground)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            ›
          </button>
        )}

        <div
          ref={scrollRef}
          className="no-scrollbar"
          style={{
            height: "100%",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              height: "100%",
            }}
          >
            {/* Page 1 — GitHub Grid */}
            <div
              style={{
                width: "100%",
                minWidth: "100%",
                height: "100%",
                scrollSnapAlign: "start",
                display: "flex",
                flexDirection: "column",
                background: "transparent",
                borderRadius: vw(12),
                padding: vw(24),
              }}
            >
              <GithubGrid />
            </div>

            {/* Page 2 — Skills Physics */}
            <div
              style={{
                width: "100%",
                minWidth: "100%",
                height: "100%",
                scrollSnapAlign: "start",
                display: "flex",
                flexDirection: "column",
                background: "transparent",
                borderRadius: vw(12),
                padding: vw(24),
              }}
            >
              <SkillsPhysics skills={SKILLS} />
            </div>

            {/* Page 3 — Lastfm Stats */}
            <div
              style={{
                width: "100%",
                minWidth: "100%",
                height: "100%",
                scrollSnapAlign: "start",
                display: "flex",
                flexDirection: "column",
                background: "transparent",
                borderRadius: vw(12),
                padding: vw(24),
              }}
            >
              <LastfmStats />
            </div>

            {/* Page 4 — Version Switcher (always last) */}
            <div
              style={{
                width: "100%",
                minWidth: "100%",
                height: "100%",
                scrollSnapAlign: "start",
                display: "flex",
                flexDirection: "column",
                background: "transparent",
                borderRadius: vw(12),
                gap: vw(140),
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <h1
                  className="text-center font-rajdhani m-0 uppercase"
                  style={{
                    fontSize: vw(32),
                    fontWeight: "bold",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  Visit other versions
                </h1>

                <div style={{ textAlign: "center", lineHeight: 1 }}>
                  <span
                    className="font-rajdhani"
                    style={{
                      fontSize: vw(32),
                      color: hoveredVersion === 1 ? "#EC1D39" : "inherit",
                      opacity: hoveredVersion ? 1 : 0,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    {hoveredVersion === 1 ? "Version 1" : "Version 2"}
                  </span>
                  {hoveredVersion === 2 && (
                    <span
                      className="font-rajdhani text-muted-foreground"
                      style={{
                        fontSize: vw(32),
                        opacity: 0.5,
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      {" "}(current)
                    </span>
                  )}
                </div>
              </div>

              <VersionSwitcher hovered={hoveredVersion} onHoverChange={setHoveredVersion} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
