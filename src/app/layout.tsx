import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import type { ReactNode } from "react";

const display = Cormorant_Garamond({
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600"],
});

const mincho = Shippori_Mincho({
  preload: false,
  variable: "--font-mincho",
  weight: ["500", "600"],
});

const body = Zen_Kaku_Gothic_New({
  preload: false,
  variable: "--font-body",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Kiroku — 購入品ログ",
  description: "今季買った服と買う予定の服をかわいく残す購入品ログ",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  appleWebApp: {
    capable: true,
    title: "Kiroku",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f1ebe2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${display.variable} ${mincho.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
