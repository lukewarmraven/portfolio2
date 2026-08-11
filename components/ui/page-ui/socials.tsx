"use client";

import { useState } from "react";
import { vw } from "@/lib/utils";
import { SOCIALS, UI_STRINGS } from "@/lib/content";

export default function Socials() {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(SOCIALS[3].url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex justify-between items-center">
      {SOCIALS.map((s) =>
        s.name === "Email" ? (
          <button
            key={s.name}
            onClick={copyEmail}
            className="font-rajdhani border-none bg-transparent cursor-pointer p-0 text-black hover:text-black"
            style={{ fontSize: vw(32), display: "grid", overflow: "hidden" }}
          >
            <span
              style={{
                gridArea: "1 / 1",
                transform: copied ? "translateY(100%)" : "translateY(0)",
                opacity: copied ? 0 : 1,
                transition: "transform 0.3s ease, opacity 0.3s ease",
              }}
            >
              {s.name}
            </span>
            <span
              style={{
                gridArea: "1 / 1",
                transform: copied ? "translateY(0)" : "translateY(-100%)",
                opacity: copied ? 1 : 0,
                transition: "transform 0.5s ease, opacity 0.5s ease",
              }}
            >
              {UI_STRINGS.copied}
            </span>
          </button>
        ) : (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-rajdhani no-underline text-black hover:text-black transition-all duration-500 ease-in-out"
            style={{ fontSize: vw(32) }}
          >
            {s.name}
          </a>
        )
      )}
    </div>
  );
}