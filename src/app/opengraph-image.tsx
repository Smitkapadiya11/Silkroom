import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Silk Room — Ribbed Zip Polos";
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
          background: "#12121A",
          color: "#DED6C4",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: "0.2em", textTransform: "uppercase" }}>
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
            The polo edit
          </div>
          <div style={{ marginTop: 24, fontSize: 32, color: "#928C7D" }}>
            ₹399 each · Combo savings
          </div>
        </div>
        <div
          style={{
            width: "100%",
            height: 8,
            background: "linear-gradient(90deg, #0F5E5C, #B4407A, #C9973F)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
