import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Kiroku",
  description: "今季買った服と買う予定の服を記録するアプリ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
