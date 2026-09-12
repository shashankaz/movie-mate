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
          "radial-gradient(ellipse at top left, rgba(59,130,246,0.22), transparent 55%), #ffffff",
        color: "#172554",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "#1d4ed8",
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
          <div style={{ color: "#1d4ed8" }}>perfectly in sync.</div>
        </div>
        <div style={{ fontSize: 30, color: "#475569", maxWidth: 900 }}>
          Create a room, share the link, paste a video. Host-controlled playback and live chat.
        </div>
      </div>
    </div>,
    { ...size },
  );
}
