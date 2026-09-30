import "server-only";
import { headers } from "next/headers";
import QRCode from "qrcode";

/** Public URL of the app: NEXT_PUBLIC_SITE_URL when set, else the current request's host. */
export async function siteUrl() {
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const url = origin.replace(/\/$/, "");
  return { url, display: url.replace(/^https?:\/\//, "") };
}

/** Ink-on-paper QR code as an SVG string. */
export function qrSvg(url: string) {
  return QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#1d1a16", light: "#fffdf7" },
  });
}
