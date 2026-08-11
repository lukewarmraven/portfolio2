"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { vw } from "@/lib/utils";

interface GithubData {
  name: string;
  avatarUrl: string;
  bio: string;
  url: string;
  followers: { totalCount: number };
  following: { totalCount: number };
  repositories: {
    totalCount: number;
    nodes: {
      name: string;
      description: string;
      url: string;
      stargazerCount: number;
      primaryLanguage: { name: string; color: string } | null;
    }[];
  };
  contributionsCollection: {
    contributionCalendar: {
      totalContributions: number;
      weeks: {
        contributionDays: { contributionCount: number; date: string }[];
      }[];
    };
  };
}

import { GITHUB_CONTRIBUTION_LEVELS, GITHUB_DAY_LABELS, GITHUB_MONTHS, STAR_ASSET, AVATAR_COLORS, UI_STRINGS } from "@/lib/content";

const CELL = vw(24);
const GAP = vw(6);

function GitHubGreen(count: number): string {
  if (count === 0) return GITHUB_CONTRIBUTION_LEVELS[0];
  if (count <= 2) return GITHUB_CONTRIBUTION_LEVELS[1];
  if (count <= 5) return GITHUB_CONTRIBUTION_LEVELS[2];
  if (count <= 10) return GITHUB_CONTRIBUTION_LEVELS[3];
  return GITHUB_CONTRIBUTION_LEVELS[4];
}

export default function GithubGrid() {
  const [data, setData] = useState<GithubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/github")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Scroll indicator — must be before early returns
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<"hidden" | "more" | "end">("hidden");

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 2) {
      setScrollState("hidden");
      return;
    }
    setScrollState(scrollHeight - scrollTop - clientHeight < 16 ? "end" : "more");
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: vw(48) }}>
        <span className="font-rajdhani text-muted-foreground" style={{ fontSize: vw(32) }}>
          Loading...
        </span>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: "center", padding: vw(48) }}>
        <span className="font-rajdhani text-muted-foreground" style={{ fontSize: vw(32) }}>
          Failed to load GitHub data.
        </span>
      </div>
    );
  }

  // Last ~4 months (~18 weeks) so grid fits without scrolling
  const weeks = data.contributionsCollection.contributionCalendar.weeks;
  const recentWeeks = weeks.slice(-12);
  const daysOfWeek = 7;
  const username = data.url.split("/").pop() || "";

  return (
    <div
      ref={scrollRef}
      onScroll={updateScrollState}
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
        GitHub
      </h2>

      {/* Avatar + info */}
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: vw(8) }}
      >
        <img
          src={data.avatarUrl}
          alt={data.name}
          style={{
            width: vw(80),
            height: vw(80),
            borderRadius: "50%",
            filter: `drop-shadow(0 ${vw(15)} ${vw(4)} rgba(0,0,0,0.5))`,
          }}
        />
        <span
          className="font-rajdhani font-bold"
          style={{
            fontSize: vw(32),
            textShadow: `0 ${vw(15)} ${vw(4)} rgba(0,0,0,0.5)`,
            display: "flex",
            gap: vw(8),
          }}
        >
          <span style={{ textShadow: "0 3px 4px rgba(0,0,0,0.45)" }}>
            {data.name || username}
          </span>
          <span style={{ fontWeight: 400, opacity: 0.5, textShadow: "0 3px 4px rgba(0,0,0,0.25)" }}>
            (@{username})
          </span>
        </span>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: vw(24),
        }}
      >
        <Stat label="Repos" value={data.repositories.totalCount} />
        <Stat
          label="Contributions"
          value={data.contributionsCollection.contributionCalendar.totalContributions}
        />
        <Stat label="Followers" value={data.followers.totalCount} />
      </div>

      {/* Contribution grid with labels */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: GAP, justifyContent: "center" }}>
          {/* Day labels column */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP, flexShrink: 0, marginRight: vw(4), paddingTop: vw(24) }}>
            {GITHUB_DAY_LABELS.map((label, di) => (
              <div
                key={di}
                style={{
                  width: vw(28),
                  height: CELL,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span className="font-rajdhani" style={{ fontSize: vw(20), color: "var(--color-foreground)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Weeks */}
          {recentWeeks.map((week, wi) => {
            const firstDay = week.contributionDays[0];
            const currMonth = firstDay
              ? new Date(firstDay.date + "T00:00:00").getMonth()
              : -1;
            const prevFirstDay = wi > 0 ? recentWeeks[wi - 1].contributionDays[0] : null;
            const prevMonth = prevFirstDay
              ? new Date(prevFirstDay.date + "T00:00:00").getMonth()
              : -1;
            const showMonth = wi === 0 || (currMonth !== -1 && currMonth !== prevMonth);
            const isActive = hoveredMonth === null || hoveredMonth === currMonth;
            const isDimmed = hoveredMonth !== null && hoveredMonth !== currMonth && currMonth !== -1;

            return (
              <div
                key={wi}
                onMouseEnter={() => currMonth !== -1 && setHoveredMonth(currMonth)}
                onMouseLeave={() => setHoveredMonth(null)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: GAP,
                  position: "relative",
                  paddingTop: vw(24),
                  transition: "filter 0.35s ease, opacity 0.35s ease",
                  filter: isDimmed ? "blur(3px)" : "none",
                  opacity: isDimmed ? 0.3 : 1,
                }}
              >
                {/* Month label */}
                {showMonth && (
                  <span
                    className="font-rajdhani"
                    style={{
                      fontSize: vw(20),
                      color: "var(--color-foreground)",
                      whiteSpace: "nowrap",
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      opacity: isActive ? 1 : 0.5,
                      transition: "opacity 0.35s ease",
                    }}
                  >
                    {GITHUB_MONTHS[currMonth]}
                  </span>
                )}
                {/* Day cells */}
                {Array.from({ length: daysOfWeek }).map((_, di) => {
                  const day = week.contributionDays[di];
                  const count = day?.contributionCount ?? 0;
                  return (
                    <div
                      key={di}
                      title={day ? `${day.date}: ${count} contributions` : ""}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: vw(3),
                        background: GitHubGreen(count),
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top repos */}
      <div style={{ display: "flex", flexDirection: "column", gap: vw(8) }}>
        <h3
          className="font-rajdhani font-bold m-0"
          style={{ fontSize: vw(32), textAlign: "center" }}
        >
          Top Repos
        </h3>
        {data.repositories.nodes.map((repo) => (
          <a
            key={repo.name}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: vw(16),
              borderRadius: vw(12),
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: vw(2) }}>
              <span className="font-rajdhani font-bold" style={{ fontSize: vw(32) }}>
                {repo.name}
              </span>
              <span className="font-rajdhani text-muted-foreground" style={{ fontSize: vw(32) }}>
                {repo.description?.slice(0, 60)}
                {repo.description?.length > 60 ? "..." : ""}
              </span>
              {repo.primaryLanguage && (
                <span
                  className="font-rajdhani"
                  style={{
                    fontSize: vw(20),
                    color: repo.primaryLanguage.name === "JavaScript" ? "#F59E0B" : repo.primaryLanguage.color,
                    background: (repo.primaryLanguage.name === "JavaScript" ? "#F59E0B" : repo.primaryLanguage.color) + "18",
                    padding: `${vw(2)} ${vw(10)}`,
                    borderRadius: vw(20),
                    alignSelf: "flex-start",
                    lineHeight: 1.2,
                  }}
                >
                  {repo.primaryLanguage.name}
                </span>
              )}
            </div>
            <span className="font-rajdhani" style={{ fontSize: vw(32), flexShrink: 0, display: "flex", alignItems: "center", gap: vw(4) }}>
              <img src={STAR_ASSET} alt="" style={{ width: vw(24), height: vw(24) }} />
              {repo.stargazerCount}
            </span>
          </a>
        ))}
      </div>

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
          {scrollState === "more" ? "-- Scroll for more --" : scrollState === "end" ? "— End —" : "-- Scroll for more --"}
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span className="font-league-gothic" style={{ fontSize: vw(32) }}>
        {value.toLocaleString()}
      </span>
      <span className="font-rajdhani text-muted-foreground" style={{ fontSize: vw(32) }}>
        {label}
      </span>
    </div>
  );
}
