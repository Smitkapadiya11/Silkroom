import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Silk Room — 3 FOR ₹799";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#f6f2ea",
          color: "#14131a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: "0.2em", textTransform: "uppercase", color: "#0b5450" }}>
          Silk Room
        </div>
        <div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.06em",
              lineHeight: 0.95,
            }}
          >
            3 FOR ₹799
          </div>
          <div style={{ marginTop: 24, fontSize: 32, color: "#6e6a62" }}>
            ₹399 each · 5 for ₹1,299 · Secure prepaid checkout
          </div>
        </div>
        <div
          style={{
            width: "100%",
            height: 8,
            background: "linear-gradient(90deg, #0b5450, #d9432e, #b98a2f)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
