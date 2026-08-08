"use client";

import { vw } from "@/lib/utils";

const BIRD_URL = "/assets/misc/bird.png";

const birdMask: React.CSSProperties = {
  maskImage: `url('${BIRD_URL}')`,
  maskSize: "contain",
  maskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskImage: `url('${BIRD_URL}')`,
  WebkitMaskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
};

const popTransition = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";

interface VersionSwitcherProps {
  hovered: number | null;
  onHoverChange: (v: number | null) => void;
}

export default function VersionSwitcher({ hovered, onHoverChange }: VersionSwitcherProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* V1 bird */}
      <a
        href="https://quintoravenluke1.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ zIndex: 2, display: "block" }}
        onMouseEnter={() => onHoverChange(1)}
        onMouseLeave={() => onHoverChange(null)}
      >
        <div
          style={{
            ...birdMask,
            width: vw(320),
            height: vw(320),
            background: "#EC1D39",
            transition: popTransition,
            transform: hovered === 1 ? "translateY(-16px)" : "translateY(0)",
          }}
        />
      </a>

      {/* V2 bird */}
      <a
        href="https://quintoravenluke2.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          zIndex: 1,
          marginLeft: vw(-200),
          display: "block",
        }}
        onMouseEnter={() => onHoverChange(2)}
        onMouseLeave={() => onHoverChange(null)}
      >
        <div
          style={{
            ...birdMask,
            width: vw(320),
            height: vw(320),
            background: "black",
            transition: popTransition,
            transform: hovered === 2 ? "translateY(-16px)" : "translateY(0)",
          }}
        />
      </a>
    </div>
  );
}
