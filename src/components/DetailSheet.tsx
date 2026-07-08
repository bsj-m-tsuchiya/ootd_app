"use client";

import { useEffect, useRef } from "react";
import DetailEditForm from "@/src/components/DetailEditForm";
import { displayBrand, formatPrice, formatReminder, imageOf, seasonOf } from "@/src/lib/format";
import { DetailDraft, Item } from "@/src/lib/types";

type Props = {
  item: Item;
  draft: DetailDraft | null;
  editing: boolean;
  onClose: () => void;
  onEditStart: () => void;
  onEditCancel: () => void;
  onUpdateDraft: <Key extends keyof DetailDraft>(key: Key, value: DetailDraft[Key]) => void;
  onSave: () => void;
  onDelete: () => void;
  onOpenCalendar: (item: Item) => void;
  onToggleBest: (item: Item) => void;
  onNotify: (message: string, tone?: "info" | "success" | "error") => void;
};

export default function DetailSheet({
  item,
  draft,
  editing,
  onClose,
  onEditStart,
  onEditCancel,
  onUpdateDraft,
  onSave,
  onDelete,
  onOpenCalendar,
  onToggleBest,
  onNotify,
}: Props) {
  const sheetRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleGrabberDown(event: React.PointerEvent) {
    dragStart.current = event.clientY;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handleGrabberMove(event: React.PointerEvent) {
    if (dragStart.current === null || !sheetRef.current) return;
    const delta = Math.max(0, event.clientY - dragStart.current);
    sheetRef.current.style.transform = `translateY(${delta}px)`;
    sheetRef.current.style.transition = "none";
  }

  function handleGrabberUp(event: React.PointerEvent) {
    if (dragStart.current === null || !sheetRef.current) return;
    const delta = Math.max(0, event.clientY - dragStart.current);
    dragStart.current = null;
    sheetRef.current.style.transition = "";

    if (delta > 90) {
      onClose();
    } else {
      sheetRef.current.style.transform = "";
    }
  }

  return (
    <div className="detail-backdrop" onClick={onClose}>
      <section
        aria-modal="true"
        className="detail-sheet"
        onClick={(event) => event.stopPropagation()}
        ref={sheetRef}
        role="dialog"
      >
        <button
          aria-label="下にスワイプで閉じる"
          className="sheet-grabber"
          onPointerCancel={handleGrabberUp}
          onPointerDown={handleGrabberDown}
          onPointerMove={handleGrabberMove}
          onPointerUp={handleGrabberUp}
          type="button"
        >
          <span />
        </button>
        <button aria-label="閉じる" className="detail-close" onClick={onClose} ref={closeRef} type="button">
          <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div
          className="detail-image"
          style={{ backgroundImage: `url(${editing && draft ? draft.imagePath : imageOf(item)})` }}
        />
        <div className="detail-body">
          <div className="detail-type-row">
            <span className="detail-type">{item.type === "purchased" ? "買った服" : "買うもの"}</span>
            {item.type === "purchased" && !editing ? (
              <button
                aria-pressed={item.isBest}
                className={item.isBest ? "best-toggle active" : "best-toggle"}
                onClick={() => onToggleBest(item)}
                type="button"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M4.5 18.5h15l.9-10.7-5.1 3.9L12 4.8 8.7 11.7 3.6 7.8l.9 10.7Z" />
                </svg>
                {item.isBest ? "ベストバイ" : "ベストに選ぶ"}
              </button>
            ) : null}
          </div>
          <h2>{displayBrand(item)}</h2>
          {editing && draft ? (
            <DetailEditForm
              draft={draft}
              item={item}
              onCancel={onEditCancel}
              onNotify={onNotify}
              onSave={onSave}
              onUpdate={onUpdateDraft}
            />
          ) : (
            <>
              {item.url ? (
                <button
                  className={item.type === "want" ? "detail-link primary-link" : "detail-link"}
                  onClick={() => window.open(item.url || "", "_blank", "noopener,noreferrer")}
                  type="button"
                >
                  {item.type === "want" ? "購入リンクを開く" : "リンクを開く"}
                </button>
              ) : null}
              {item.type === "want" ? (
                <button
                  className="detail-link calendar-link"
                  disabled={!item.reminderAt}
                  onClick={() => onOpenCalendar(item)}
                  type="button"
                >
                  Googleカレンダーに追加
                </button>
              ) : null}
              <dl className="detail-meta">
                <dt>商品名</dt>
                <dd>{item.name || "未入力"}</dd>
                <dt>サイズ</dt>
                <dd>{item.size || "未入力"}</dd>
                {item.price ? (
                  <>
                    <dt>値段</dt>
                    <dd>{formatPrice(item.price)}</dd>
                  </>
                ) : null}
                <dt>シーズン</dt>
                <dd>{seasonOf(item)}</dd>
                {item.type === "purchased" && item.purchaseMonth ? (
                  <>
                    <dt>購入月</dt>
                    <dd>{item.purchaseMonth}月</dd>
                  </>
                ) : null}
                {item.type === "want" ? (
                  <>
                    <dt>予定</dt>
                    <dd>{formatReminder(item.reminderAt)}</dd>
                  </>
                ) : null}
              </dl>
              <p className="detail-memo">{item.memo || "まだメモはありません。"}</p>
              <div className="detail-actions">
                <button className="detail-secondary" onClick={onEditStart} type="button">
                  編集
                </button>
                <button className="detail-danger" onClick={onDelete} type="button">
                  削除
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
