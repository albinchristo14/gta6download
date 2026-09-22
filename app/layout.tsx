import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GTA 6 Download Hub", template: "%s | GTA6Download" },
  description: "GTA 6 download status, release date, news, and where to buy.",
  metadataBase: new URL("https://gta6download.store"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
