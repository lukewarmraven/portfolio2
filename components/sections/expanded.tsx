"use client";

import { type ReactNode } from "react";
import { vw } from "@/lib/utils";

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
      style={{ height: "100%", gap: vw(16) }}
    >
      {/* Back button */}

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
            gap: vw(16),
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

          {/* Image gallery slot */}
          {children ?? (
            <div
              className="flex items-center justify-center border border-dashed"
              style={{
                minHeight: vw(200),
                borderRadius: vw(8),
                borderColor: "var(--color-border)",
              }}
            >
              <span
                className="font-rajdhani text-muted-foreground"
                style={{ fontSize: vw(32) }}
              >
                — Image gallery —
              </span>
            </div>
          )}

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
