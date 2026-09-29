import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Kalam } from "next/font/google";
import "./globals.css";

// UI font
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
// Dates, counters, data only
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500", "700"] });
// Handwritten answers and signature lines only, never below 17px
const kalam = Kalam({ variable: "--font-kalam", subsets: ["latin", "devanagari"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Roamies",
  description: "The anti-swipe travel app. Designed to be closed once you book your trip.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3eee5",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${jetbrains.variable} ${kalam.variable} antialiased`}>
      <body className="bg-paper2 font-sans text-[15px] leading-[22px]">
        {/* Phone-width app frame; on desktop it sits centred like a device. */}
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg shadow-sheet">{children}</div>
      </body>
    </html>
  );
}
