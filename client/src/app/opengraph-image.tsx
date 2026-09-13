import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background:
          "radial-gradient(ellipse at top left, rgba(139,92,246,0.35), transparent 55%), radial-gradient(ellipse at bottom right, rgba(139,92,246,0.10), transparent 55%), #09090b",
        color: "#f5f3ff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "linear-gradient(135deg, #8b5cf6, #c026d3)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          ▶
        </div>
        <div style={{ fontSize: 36, fontWeight: 600 }}>{site.name}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -3,
          }}
        >
          <div>Watch together,</div>
          <div style={{ color: "#a78bfa" }}>perfectly in sync.</div>
        </div>
        <div style={{ fontSize: 30, color: "#a1a1aa", maxWidth: 900 }}>
          Create a room, share the link, paste a video. Host-controlled playback and live chat.
        </div>
      </div>
    </div>,
    { ...size },
  );
}
