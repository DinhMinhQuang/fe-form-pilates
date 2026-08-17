import type { MetadataRoute } from "next";

// next.config.ts uses output: "export" (fully static export) — generated
// metadata routes must opt into static generation explicitly under that mode.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FORM Pilates",
    short_name: "FORM Pilates",
    description: "Hệ thống quản lý lịch học FORM Pilates",
    start_url: "/",
    display: "standalone",
    background_color: "#E4E0D8",
    theme_color: "#E4E0D8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      // Vector fallback for browsers that support SVG manifest icons — PNGs
      // above stay as the safe default (better maskable/Android support).
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
