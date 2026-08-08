"use client";

import { useState } from "react";
import { vw } from "@/lib/utils";
import SkillsPhysics from "@/components/ui/reusable-ui/skills-physics";
import VersionSwitcher from "@/components/ui/reusable-ui/version-switcher";

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

      <div
        className="no-scrollbar"
        style={{
          flex: "1 1 0",
          minHeight: 0,
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
          {/* Page 1 — Skills Physics */}
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

          {/* Page 2 — Version Switcher */}
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
            {/* Heading + title — tight together */}
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
    </section>
  );
}
