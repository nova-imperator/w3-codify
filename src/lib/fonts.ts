import localFont from "next/font/local";
import { Inter } from "next/font/google";

// Display — Clash Display (Fontshare), self-hosted variable font (§5.2)
export const clashDisplay = localFont({
  src: "../../public/fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// Secondary display / strong body — Satoshi (Fontshare), self-hosted
export const satoshi = localFont({
  src: "../../public/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// Body — Inter (§5.2)
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const fontVariables = `${clashDisplay.variable} ${satoshi.variable} ${inter.variable}`;
