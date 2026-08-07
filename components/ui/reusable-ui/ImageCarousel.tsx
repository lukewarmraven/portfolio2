"use client";

import { useRef } from "react";
import { vw } from "@/lib/utils";

export interface ImageCarouselProps {
  images: string[];
  /** Design px for square sides. Default: 400. */
  size?: number;
  /** Design px gap between images. Default: 12. */
  gap?: number;
  className?: string;
  /** Called when an image is clicked (not during scroll). Receives the index and the tile element. */
  onImageClick?: (index: number, element: HTMLElement) => void;
  /** When set, the tile at this index performs a 3D card-flip (rotateY 180°).
   *  Used to coordinate the "flip-away" with the modal appearing. */
  activeIndex?: number | null;
}

const FLIP_DURATION = 400; // ms
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export default function ImageCarousel({
  images,
  size = 400,
  gap = 12,
  className,
  onImageClick,
  activeIndex,
}: ImageCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);

  if (images.length === 0) return null;

  const interactive = !!onImageClick;
  const hasActive = activeIndex !== undefined && activeIndex !== null;

  return (
    <div
      ref={containerRef}
      className={`no-scrollbar overflow-x-auto ${className ?? ""}`}
      style={{ WebkitOverflowScrolling: "touch" }}
      onWheel={(e) => {
        const el = containerRef.current;
        if (!el) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          el.scrollLeft += e.deltaY;
        }
      }}
    >
      <div
        style={{ display: "flex", gap: vw(gap) }}
        onPointerDown={(e) => {
          pointerOrigin.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          if (!pointerOrigin.current || !onImageClick) return;
          const dx = e.clientX - pointerOrigin.current.x;
          const dy = e.clientY - pointerOrigin.current.y;
          if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
            const tile = (e.target as HTMLElement).closest("[data-carousel-index]");
            if (tile) {
              const idx = Number(tile.getAttribute("data-carousel-index"));
              onImageClick(idx, tile as HTMLElement);
            }
          }
          pointerOrigin.current = null;
        }}
      >
        {images.map((src, i) => {
          const isFlipping = activeIndex === i;

          return (
            <div
              key={i}
              data-carousel-index={i}
              style={{
                width: vw(size),
                height: vw(size),
                flexShrink: 0,
                borderRadius: vw(8),
                // ── 3D card-flip (same DNA as CallingCard) ──
                transform: isFlipping
                  ? `perspective(${vw(800)}) rotateY(180deg)`
                  : "none",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transition: interactive
                  ? `transform ${FLIP_DURATION}ms ${EASE}`
                  : undefined,
              }}
            >
              {/* Inner wrapper isolates the hover-scale from the flip transform */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "inherit",
                  overflow: "hidden",
                  cursor: interactive ? "pointer" : "default",
                  transition:
                    interactive && !hasActive
                      ? "transform 0.2s ease, box-shadow 0.2s ease"
                      : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!interactive || hasActive) return;
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "scale(1.03)";
                  el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  if (!interactive || hasActive) return;
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "scale(1)";
                  el.style.boxShadow = "none";
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
