"use client";

import { type ReactNode } from "react";
import { vw } from "@/lib/utils";
import ImageCarousel from "@/components/ui/reusable-ui/ImageCarousel";

const DEMO_IMAGES = [
  "/assets/projects/resbac/web0.png",
  "/assets/projects/resbac/web1.png",
  "/assets/projects/resbac/web2.png",
  "/assets/projects/resbac/web3.png",
  "/assets/projects/resbac/mob0.jpg",
  "/assets/projects/resbac/mob1.jpg",
];

export interface ExpandedProps {
  title: string;
  body: string;
  onBack?: () => void;
  children?: ReactNode;
  className?: string;
}

export default function Expanded({
  title,
  body,
  onBack,
  children,
  className,
}: ExpandedProps) {
  return (
    <section
      className={`flex flex-col ${className ?? ""}`}
      style={{ height: "100%", gap: vw(32) }}
    >
      {/* Title — vw(32), all caps, bold */}
      <h1
        className="text-center font-rajdhani m-0 uppercase"
        style={{ fontSize: vw(32), fontWeight: "bold" }}
      >
        {title}
      </h1>

      {/* Scrollable content area */}
      <div
        className="no-scrollbar"
        style={{ overflowY: "auto", flex: "1 1 0", minHeight: 0 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: vw(32),
          }}
        >
          {/* Text body — 4-line clamp, scrollable */}
          <div
            className="no-scrollbar"
            style={{ overflowY: "auto", maxHeight: vw(210) }}
          >
            <p
              className="font-rajdhani m-0 text-justify"
              style={{ fontSize: vw(32) }}
            >
              {body}
            </p>
          </div>

          {/* Image gallery */}
          {children ?? <ImageCarousel images={DEMO_IMAGES} />}

          {onBack && (
            <button
              onClick={onBack}
              className="font-rajdhani text-muted-foreground text-center"
              style={{ fontSize: vw(32) }}
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
