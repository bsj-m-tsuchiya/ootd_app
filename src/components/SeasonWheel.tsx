"use client";

import { useRef, useState } from "react";
import { summaryLabelFor } from "@/src/lib/format";
import { SummaryFrame } from "@/src/lib/types";

type Props = {
  seasons: string[];
  activeSeason: string;
  frame: SummaryFrame;
  onSelect: (season: string) => void;
};

const DRAG_STEP = 38;

export default function SeasonWheel({ seasons, activeSeason, frame, onSelect }: Props) {
  const list = seasons.length ? seasons : [activeSeason];
  const [highlight, setHighlight] = useState(() => Math.max(0, list.indexOf(activeSeason)));
  const drag = useRef<{ startY: number; startIndex: number; moved: boolean } | null>(null);
  const wheelBuffer = useRef(0);

  function clampIndex(index: number) {
    return Math.max(0, Math.min(list.length - 1, index));
  }

  function handleWheel(event: React.WheelEvent) {
    wheelBuffer.current += event.deltaY;
    if (Math.abs(wheelBuffer.current) < 24) return;
    const step = wheelBuffer.current > 0 ? 1 : -1;
    wheelBuffer.current = 0;
    setHighlight((current) => clampIndex(current + step));
  }

  function handlePointerDown(event: React.PointerEvent) {
    drag.current = { startY: event.clientY, startIndex: highlight, moved: false };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!drag.current) return;
    const delta = event.clientY - drag.current.startY;
    if (Math.abs(delta) > 6) drag.current.moved = true;
    setHighlight(clampIndex(drag.current.startIndex - Math.round(delta / DRAG_STEP)));
  }

  function handlePointerUp() {
    if (!drag.current) return;
    const wasDrag = drag.current.moved;
    drag.current = null;
    if (wasDrag) onSelect(list[highlight]);
  }

  return (
    <div
      aria-label="シーズンを選択（ドラッグでも回せます）"
      className="summary-season-wheel"
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {list.map((season, index) => (
        <button
          className={index === highlight ? "active" : ""}
          key={season}
          onClick={() => onSelect(season)}
          type="button"
        >
          {summaryLabelFor(season, frame)}
        </button>
      ))}
    </div>
  );
}
