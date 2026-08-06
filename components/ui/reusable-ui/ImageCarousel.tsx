"use client";

import { useRef } from "react";
import { vw } from "@/lib/utils";

export interface ImageCarouselProps {
  images: string[];
  /** Design px for square sides. Default: 160. */
  size?: number;
  /** Design px gap between images. Default: 12. */
  gap?: number;
  className?: string;
}

export default function ImageCarousel({
  images,
  size = 400,
  gap = 12,
  className,
}: ImageCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`no-scrollbar overflow-x-auto ${className ?? ""}`}
      style={{ WebkitOverflowScrolling: "touch" }}
      onWheel={(e) => {
        const el = containerRef.current;
        if (!el) return;
        // Redirect vertical wheel to horizontal scroll; let horizontal pass through naturally
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          el.scrollLeft += e.deltaY;
        }
      }}
    >
      <div style={{ display: "flex", gap: vw(gap) }}>
        {images.map((src, i) => (
          <div
            key={i}
            style={{
              width: vw(size),
              height: vw(size),
              flexShrink: 0,
              borderRadius: vw(8),
              overflow: "hidden",
            }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
