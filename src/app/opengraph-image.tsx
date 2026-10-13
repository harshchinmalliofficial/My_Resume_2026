import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Harsh Chinmalli, LLM systems engineer";

export default function OG() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0e1011", color: "#ebe9e3" }}>
      <div style={{ fontSize: 28, color: "#9c9e99" }}>SOFTWARE ENGINEER / AI SYSTEMS</div>
      <div style={{ fontSize: 84, lineHeight: 1.05, letterSpacing: -3, display: "flex", flexWrap: "wrap" }}>
        I build AI systems that reason, retrieve, and&nbsp;<span style={{ color: "#f2703d" }}>act.</span>
      </div>
      <div style={{ fontSize: 32 }}>Harsh Chinmalli</div>
    </div>,
    size,
  );
}
