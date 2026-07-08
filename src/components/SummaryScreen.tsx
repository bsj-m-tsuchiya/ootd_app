"use client";

import { useRef } from "react";
import SeasonWheel from "@/src/components/SeasonWheel";
import { displayBrand, imageOf, seasonEyebrow, statsLineFor, summaryLabelFor } from "@/src/lib/format";
import { Item, SummaryFrame } from "@/src/lib/types";

type Props = {
  items: Item[];
  seasons: string[];
  activeSeason: string;
  frame: SummaryFrame;
  handle: string;
  wheelOpen: boolean;
  onSelectSeason: (season: string) => void;
  onWheelOpenChange: (open: boolean) => void;
  onFrameToggle: () => void;
  onOpenExport: () => void;
  onOpenDetail: (item: Item) => void;
};

export default function SummaryScreen({
  items,
  seasons,
  activeSeason,
  frame,
  handle,
  wheelOpen,
  onSelectSeason,
  onWheelOpenChange,
  onFrameToggle,
  onOpenExport,
  onOpenDetail,
}: Props) {
  const holdTimer = useRef<number | null>(null);

  function startHold() {
    clearHold();
    holdTimer.current = window.setTimeout(() => onWheelOpenChange(true), 420);
  }

  function clearHold() {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  }

  return (
    <section className="summary-screen" key="summary">
      <header className="summary-head">
        <div className="summary-toolbar">
          <button
            aria-label="ベスト枠を切り替え"
            aria-pressed={frame === "best"}
            className={frame === "best" ? "crown-toggle active" : "crown-toggle"}
            onClick={onFrameToggle}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M4.5 18.5h15l.9-10.7-5.1 3.9L12 4.8 8.7 11.7 3.6 7.8l.9 10.7Z" />
              <path d="M5 21h14" />
            </svg>
            <span>{frame === "best" ? "ベスト枠" : "購入品枠"}</span>
          </button>
          <button className="export-open" disabled={items.length === 0} onClick={onOpenExport} type="button">
            <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
              <path d="M12 4v11.5M7.5 11l4.5 4.5L16.5 11" />
              <path d="M4.5 19.5h15" />
            </svg>
            画像にする
          </button>
        </div>

        <p className="summary-eyebrow">{seasonEyebrow(activeSeason)}</p>

        <div className="summary-season-slot">
          {wheelOpen ? (
            <SeasonWheel
              activeSeason={activeSeason}
              frame={frame}
              seasons={seasons}
              onSelect={(season) => {
                onSelectSeason(season);
                onWheelOpenChange(false);
              }}
            />
          ) : (
            <button
              className="summary-season-title"
              onClick={() => {
                clearHold();
                onWheelOpenChange(true);
              }}
              onPointerCancel={clearHold}
              onPointerDown={startHold}
              onPointerLeave={clearHold}
              onPointerUp={clearHold}
              type="button"
            >
              {summaryLabelFor(activeSeason, frame)}
            </button>
          )}
        </div>
        <p className="summary-stats">{statsLineFor(items)}</p>
        <p className="summary-wordmark">{handle ? `@${handle.toUpperCase()}` : "KIROKU"}</p>
      </header>

      <div className="summary-grid">
        {items.map((item, index) => (
          <button
            aria-label={`${displayBrand(item)} ${item.name || ""}の詳細を開く`}
            className="summary-item"
            key={item.id}
            onClick={() => onOpenDetail(item)}
            style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
            type="button"
          >
            <span className="summary-item-image" style={{ backgroundImage: `url(${imageOf(item)})` }} />
            {item.isBest ? (
              <span aria-label="ベストバイ" className="best-badge">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M4.5 18.5h15l.9-10.7-5.1 3.9L12 4.8 8.7 11.7 3.6 7.8l.9 10.7Z" />
                </svg>
              </span>
            ) : null}
          </button>
        ))}
        {items.length === 0 && (
          <div className="empty-state">
            {frame === "best" ? (
              <>
                <strong>ベストバイはまだ選ばれていません</strong>
                <span>詳細画面で王冠を押すと、この枠に選抜されます。</span>
              </>
            ) : (
              <>
                <strong>この枠はまだ空です</strong>
                <span>シーズンを切り替えるか、買った服を登録すると並びます。</span>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
