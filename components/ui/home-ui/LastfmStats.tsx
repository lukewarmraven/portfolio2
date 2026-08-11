"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { vw } from "@/lib/utils";
import { LASTFM_PERIODS, AVATAR_COLORS, EASE, UI_STRINGS } from "@/lib/content";

type Period = "7day" | "1month" | "6month" | "12month" | "overall";

interface Artist {
  name: string;
  playcount: string;
  url: string;
  image: { "#text": string; size: string }[];
}

// Module-level cache — survives remounts, cleared on full reload
const cache: Record<string, Artist[]> = {};

export default function LastfmStats() {
  const [period, setPeriod] = useState<Period>("7day");
  const [artists, setArtists] = useState<Artist[]>(() => cache["7day"] || []);
  const [loading, setLoading] = useState(() => !cache["7day"]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Serve from cache if available
    if (cache[period]) {
      setArtists(cache[period]);
      setLoading(false);
      setCurrentIndex(0);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/lastfm?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const items = (data.topartists?.artist || []).slice(0, 6);
          cache[period] = items;
          setArtists(items);
          setLoading(false);
          setCurrentIndex(0);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(artists.length - 1, index)));
    },
    [artists.length],
  );

  // Detect if all images are the same placeholder
  const isPlaceholder = useMemo(() => {
    const urls = artists
      .map((a) => a.image?.find((x) => x.size === "mega")?.["#text"] || "")
      .filter(Boolean);
    return urls.length > 1 && new Set(urls).size === 1;
  }, [artists]);

  // Wheel navigation via native listener (bypasses React passive wheel)
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentRef = useRef(currentIndex);
  currentRef.current = currentIndex;

  // Scroll indicator
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const next = currentRef.current + dir;

      // At boundaries — let event bubble to parent for section scroll
      if (next < 0 || next >= artists.length) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (debounceRef.current) return;
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
      }, 400);
      goTo(next);
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [goTo, artists.length]);

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: "1 1 0",
        minHeight: 0,
        gap: vw(16),
        overflowY: "auto",
      }}
    >
      {/* Heading */}
      <h2
        className="font-rajdhani font-bold m-0 uppercase"
        style={{ fontSize: vw(32), textAlign: "center" }}
      >
        <span className="text-[#D51007]">

        LastFM {" "}
        </span>
        Listening Stats
      </h2>
      

      {/* Time-range pills */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: vw(8),
          flexWrap: "wrap",
        }}
      >
        {LASTFM_PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className="font-rajdhani skill-tag"
            style={{
              fontSize: vw(32),
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: `${vw(4)} ${vw(12)}`,
              borderRadius: vw(20),
              color: period === p.value ? "var(--color-foreground)" : "var(--color-muted-foreground)",
              fontWeight: period === p.value ? 600 : 400,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Carousel */}
      {loading ? (
        <div style={{ textAlign: "center", padding: vw(48) }}>
          <span className="font-rajdhani text-muted-foreground" style={{ fontSize: vw(32) }}>
            {UI_STRINGS.loading}
          </span>
        </div>
      ) : (
        <div
          ref={containerRef}
          style={{
            position: "relative",
            flex: "1 1 0",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {artists.map((artist, i) => {
            const offset = i - currentIndex;
            if (Math.abs(offset) > 1) return null;

            const isCurrent = offset === 0;
            const isPrev = offset === -1;
            const isNext = offset === 1;

            // Triangle positions
            const top = isCurrent ? "5%" : "55%";
            const left = isCurrent
              ? "50%"
              : isPrev
                ? "15%"
                : "85%";
            const scale = isCurrent ? 1 : 0.72;
            const opacity = isCurrent ? 1 : 0.45;
            const z = isCurrent ? 3 : 1;

            const sizes = ["mega", "extralarge", "large", "medium"] as const;
            const img = sizes
              .map((s) => artist.image?.find((x) => x.size === s)?.["#text"])
              .find((u) => u && u.length > 0) || "";

            return (
              <div
                key={artist.name}
                onClick={() => goTo(i)}
                style={{
                  position: "absolute",
                  top,
                  left,
                  transform: `translate(-50%, 0) scale(${scale})`,
                  zIndex: z,
                  opacity,
                  transition: `top 0.55s ${EASE}, left 0.55s ${EASE}, transform 0.55s ${EASE}, opacity 0.55s ease`,
                  cursor: isCurrent ? "default" : "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: vw(8),
                  userSelect: "none",
                }}
              >
                <ArtistImage
                  img={img}
                  name={artist.name}
                  placeholder={isPlaceholder}
                  large={isCurrent}
                  color={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                />
                <span
                  className="font-rajdhani"
                  style={{
                    fontSize: isCurrent ? vw(40) : vw(32),
                    textAlign: "center",
                    lineHeight: 1.1,
                    fontWeight: isCurrent ? 600 : 400,
                  }}
                >
                  {artist.name}
                </span>
                <span
                  className="font-rajdhani text-muted-foreground"
                  style={{ fontSize: vw(32) }}
                >
                  {Number(artist.playcount).toLocaleString()} plays
                </span>
              </div>
            );
          })}

          {/* Nav dots */}
          <div
            style={{
              position: "absolute",
              bottom: vw(8),
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: vw(8),
            }}
          >
            {artists.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Artist ${i + 1}`}
                style={{
                  width: i === currentIndex ? vw(10) : vw(7),
                  height: i === currentIndex ? vw(10) : vw(7),
                  borderRadius: "50%",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  background:
                    i === currentIndex
                      ? "var(--color-foreground)"
                      : "var(--color-border)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scroll indicator — always visible */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          padding: vw(32),
          paddingBottom: vw(32),
          background: "linear-gradient(transparent, var(--color-card, #fff) 60%)",
          pointerEvents: "none",
          flexShrink: 0,
          marginTop: "auto",
        }}
      >
        <span
          className="font-rajdhani text-muted-foreground"
          style={{ fontSize: vw(32), position: "relative", top: 20 }}
        >
          {artists.length > 0 && currentIndex < artists.length - 1
            ? "-- Scroll for more --"
            : "— End —"}
        </span>
      </div>
    </div>
  );
}

function ArtistImage({
  img,
  name,
  placeholder,
  large,
  color,
}: {
  img: string;
  name: string;
  placeholder: boolean;
  large: boolean;
  color: string;
}) {
  const [failed, setFailed] = useState(false);
  const showInitial = placeholder || failed || !img;
  const size = large ? vw(140) : vw(100);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        background: color,
        filter: `drop-shadow(0 ${vw(15)} ${vw(4)} rgba(0,0,0,0.5))`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!showInitial ? (
        <img
          src={img}
          alt={name}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span
          className="font-league-gothic"
          style={{
            fontSize: large ? vw(56) : vw(32),
            color: "white",
          }}
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
