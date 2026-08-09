"use client";

import { vw } from "@/lib/utils";

const PLAYLIST_ID = "6vGAgLJ3LANxI9t35Fiey5";

export default function SpotifyPlaylist() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        justifyContent: "center",
        gap: vw(16),
      }}
    >
      <h2
        className="font-rajdhani font-bold m-0 uppercase"
        style={{ fontSize: vw(32), textAlign: "center" }}
      >
        On Repeat
      </h2>
      <iframe
        src={`https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator`}
        width="100%"
        height="380"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{
          border: "none",
          borderRadius: vw(12),
          maxWidth: 500,
        }}
      />
    </div>
  );
}
