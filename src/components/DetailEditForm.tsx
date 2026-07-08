"use client";

import { ChangeEvent, useRef, useState } from "react";
import { uploadImageFile } from "@/src/lib/image";
import { DetailDraft, Item, SeasonCodeValue, monthOptions, sampleImages, yearOptions } from "@/src/lib/types";

type Props = {
  item: Item;
  draft: DetailDraft;
  onUpdate: <Key extends keyof DetailDraft>(key: Key, value: DetailDraft[Key]) => void;
  onCancel: () => void;
  onSave: () => void;
  onNotify: (message: string, tone?: "info" | "success" | "error") => void;
};

export default function DetailEditForm({ item, draft, onUpdate, onCancel, onSave, onNotify }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      onUpdate("imagePath", await uploadImageFile(file));
    } catch {
      onNotify("画像の取り込みに失敗しました。", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="detail-edit">
      <input accept="image/*" hidden onChange={handleFileChange} ref={fileInput} type="file" />
      <div aria-label="画像を選択" className="detail-image-choices">
        <button
          aria-label="写真をアップロード"
          className="upload-tile"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
          type="button"
        >
          {uploading ? "..." : "＋"}
        </button>
        {sampleImages.map((src) => (
          <button
            aria-label="画像を選択"
            aria-pressed={src === draft.imagePath}
            className={src === draft.imagePath ? "active" : ""}
            key={src}
            onClick={() => onUpdate("imagePath", src)}
            style={{ backgroundImage: `url(${src})` }}
            type="button"
          />
        ))}
      </div>
      <label className="wide">
        <span>URL <em>スキップ可</em></span>
        <input value={draft.url} onChange={(event) => onUpdate("url", event.target.value)} placeholder="https://..." />
      </label>
      <div className="detail-edit-grid">
        <label>
          <span>ブランド <em>スキップ可</em></span>
          <input value={draft.brand} onChange={(event) => onUpdate("brand", event.target.value)} placeholder="Bibiy" />
        </label>
        <label>
          <span>商品名 <em>スキップ可</em></span>
          <input value={draft.name} onChange={(event) => onUpdate("name", event.target.value)} placeholder="lace hoodie" />
        </label>
        <label>
          <span>サイズ <em>空欄でOK</em></span>
          <input value={draft.size} onChange={(event) => onUpdate("size", event.target.value)} placeholder="わかる時だけ" />
        </label>
        {item.type === "purchased" && (
          <label>
            <span>値段 <em>スキップ可</em></span>
            <input
              inputMode="numeric"
              value={draft.price}
              onChange={(event) => onUpdate("price", event.target.value)}
              placeholder="17800"
            />
          </label>
        )}
        <label>
          <span>シーズン</span>
          <div className="season-picker">
            <select value={draft.seasonYear} onChange={(event) => onUpdate("seasonYear", Number(event.target.value))}>
              {yearOptions.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
            <select
              value={draft.seasonCode}
              onChange={(event) => onUpdate("seasonCode", event.target.value as SeasonCodeValue)}
            >
              <option>SS</option>
              <option>AW</option>
            </select>
          </div>
        </label>
        {item.type === "purchased" && (
          <label>
            <span>購入月</span>
            <select value={draft.purchaseMonth} onChange={(event) => onUpdate("purchaseMonth", Number(event.target.value))}>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}月
                </option>
              ))}
            </select>
          </label>
        )}
        {item.type === "want" && (
          <label className="wide">
            <span>購入予定日時</span>
            <input
              type="datetime-local"
              value={draft.reminderAt}
              onChange={(event) => onUpdate("reminderAt", event.target.value)}
            />
          </label>
        )}
      </div>
      <label className="wide">
        <span>メモ</span>
        <textarea
          value={draft.memo}
          onChange={(event) => onUpdate("memo", event.target.value)}
          placeholder="発売日、迷っている理由、着たい予定など"
          rows={4}
        />
      </label>
      <div className="detail-actions">
        <button className="detail-secondary" onClick={onCancel} type="button">
          キャンセル
        </button>
        <button className="detail-save" onClick={onSave} type="button">
          保存
        </button>
      </div>
    </div>
  );
}
