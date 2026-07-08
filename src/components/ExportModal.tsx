"use client";

import { useEffect, useRef, useState } from "react";
import { downloadBlob, renderSummaryImage } from "@/src/lib/export-image";
import { statsLineFor, summaryLabelFor } from "@/src/lib/format";
import { saveHandle } from "@/src/lib/storage";
import {
  ExportSizeKey,
  ExportTextMode,
  Item,
  SummaryFrame,
  exportSizeOptions,
  exportSizes,
} from "@/src/lib/types";

type Props = {
  items: Item[];
  season: string;
  frame: SummaryFrame;
  sizeKey: ExportSizeKey;
  textMode: ExportTextMode;
  handle: string;
  onSizeKeyChange: (key: ExportSizeKey) => void;
  onTextModeChange: (mode: ExportTextMode) => void;
  onHandleChange: (handle: string) => void;
  onClose: () => void;
  onNotify: (message: string, tone?: "info" | "success" | "error") => void;
};

export default function ExportModal({
  items,
  season,
  frame,
  sizeKey,
  textMode,
  handle,
  onSizeKeyChange,
  onTextModeChange,
  onHandleChange,
  onClose,
  onNotify,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [rendering, setRendering] = useState(true);
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setRendering(true);

    const timer = window.setTimeout(async () => {
      try {
        const blob = await renderSummaryImage({
          items,
          season,
          frame,
          statsLine: statsLineFor(items),
          textMode,
          size: exportSizes[sizeKey],
          handle,
        });
        if (cancelled) return;
        blobRef.current = blob;
        setPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return URL.createObjectURL(blob);
        });
      } catch (error) {
        console.error(error);
        if (!cancelled) onNotify("プレビューの作成に失敗しました。", "error");
      } finally {
        if (!cancelled) setRendering(false);
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, season, frame, sizeKey, textMode, handle]);

  useEffect(
    () => () => {
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
    },
    [],
  );

  function save() {
    const blob = blobRef.current;
    if (!blob) return;
    const label = summaryLabelFor(season, frame).replace("#", "");
    downloadBlob(blob, `${label}-${exportSizes[sizeKey].label.replace(/\s/g, "-")}.png`);
    onNotify("まとめ画像を保存しました。", "success");
    onClose();
  }

  return (
    <div className="export-backdrop" onClick={onClose}>
      <section aria-modal="true" className="export-modal" onClick={(event) => event.stopPropagation()} role="dialog">
        <header className="export-modal-head">
          <strong>投稿用画像</strong>
          <button aria-label="閉じる" className="detail-close" onClick={onClose} type="button">
            <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className={`export-preview ratio-${sizeKey}`}>
          {previewUrl ? <img alt="まとめ画像プレビュー" src={previewUrl} /> : null}
          {rendering ? <span className="export-rendering">作成中...</span> : null}
        </div>

        <div className="export-controls">
          <div className="pill-group" role="group" aria-label="投稿サイズ">
            {exportSizeOptions.map(([key, option]) => (
              <button
                className={key === sizeKey ? "selected" : ""}
                key={key}
                onClick={() => onSizeKeyChange(key)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="pill-group" role="group" aria-label="文字の有無">
            <button
              className={textMode === "withText" ? "selected" : ""}
              onClick={() => onTextModeChange("withText")}
              type="button"
            >
              文字あり
            </button>
            <button
              className={textMode === "noText" ? "selected" : ""}
              onClick={() => onTextModeChange("noText")}
              type="button"
            >
              文字なし
            </button>
          </div>
          <label className="handle-field">
            <span>@</span>
            <input
              placeholder="アカウント名（画像の下に入ります）"
              value={handle}
              onChange={(event) => {
                onHandleChange(event.target.value);
                saveHandle(event.target.value);
              }}
            />
          </label>
          <button className="primary-button" disabled={rendering || !previewUrl} onClick={save} type="button">
            この画像を保存
          </button>
        </div>
      </section>
    </div>
  );
}
