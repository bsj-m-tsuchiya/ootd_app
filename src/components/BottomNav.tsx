"use client";

import type { ReactElement } from "react";
import { Screen } from "@/src/lib/types";

type Props = {
  screen: Screen;
  onChange: (screen: Screen) => void;
};

const navItems: { key: Screen; label: string; icon: ReactElement }[] = [
  {
    key: "register",
    label: "登録",
    icon: (
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8.4" />
        <path d="M12 8.6v6.8M8.6 12h6.8" />
      </svg>
    ),
  },
  {
    key: "want",
    label: "買う",
    icon: (
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M12 4.2a5 5 0 0 0-5 5c0 4-1.6 5.6-2.4 6.6h14.8c-.8-1-2.4-2.6-2.4-6.6a5 5 0 0 0-5-5Z" />
        <path d="M10.2 18.8a1.9 1.9 0 0 0 3.6 0" />
      </svg>
    ),
  },
  {
    key: "summary",
    label: "まとめ",
    icon: (
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" viewBox="0 0 24 24">
        <rect height="6.6" rx="1.4" width="6.6" x="4.2" y="4.2" />
        <rect height="6.6" rx="1.4" width="6.6" x="13.2" y="4.2" />
        <rect height="6.6" rx="1.4" width="6.6" x="4.2" y="13.2" />
        <rect height="6.6" rx="1.4" width="6.6" x="13.2" y="13.2" />
      </svg>
    ),
  },
];

export default function BottomNav({ screen, onChange }: Props) {
  return (
    <nav aria-label="メインナビゲーション" className="bottom-nav">
      {navItems.map((item) => (
        <button
          aria-current={screen === item.key ? "page" : undefined}
          className={screen === item.key ? "active" : ""}
          key={item.key}
          onClick={() => onChange(item.key)}
          type="button"
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
