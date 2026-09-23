import { ImageResponse } from "next/og";
import { siteConfig } from "@/site.config";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${siteConfig.name} — GTA 6 download status, release date and where to buy`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #07070c 0%, #1d0743 55%, #3f167f 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#8b8ba0", letterSpacing: 6 }}>
          GTA 6 · DOWNLOAD HUB
        </div>
        <div style={{ display: "flex", fontSize: 78, fontWeight: 700, color: "#ffffff", marginTop: 24, lineHeight: 1.1 }}>
          Not downloadable yet.
        </div>
        <div style={{ display: "flex", fontSize: 40, color: "#ff9d57", marginTop: 20 }}>
          Releases {siteConfig.releaseDate.slice(0, 10)} · PS5 &amp; Xbox Series X|S
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#b6b6c8", marginTop: 34 }}>
          {siteConfig.url.replace("https://", "")} — tracked against official announcements
        </div>
      </div>
    ),
    size,
  );
}
