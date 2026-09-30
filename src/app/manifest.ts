import type { MetadataRoute } from "next";

// "Add to home screen": makes Roamies open full-screen like an app.
// Splash background is the dark tile from the logo spec, so there's no flash on open.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Roamies",
    short_name: "Roamies",
    description: "The anti-swipe travel app. Designed to be closed once you book your trip.",
    start_url: "/feed",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1d1a16",
    theme_color: "#f3eee5",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
