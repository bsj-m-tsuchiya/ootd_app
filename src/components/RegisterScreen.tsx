"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import RegisterDetails, { DetailFields } from "@/src/components/RegisterDetails";
import { imageFileFromClipboard, uploadImageFile } from "@/src/lib/image";
import { ItemType, SeasonCodeValue, monthOptions, sampleImages, yearOptions } from "@/src/lib/types";

export type CreatePayload = {
  type: ItemType;
  imagePath: string;
  url: string;
  brand: string;
  name: string;
  size: string;
  price: string | null;
  seasonYear: number;
  seasonCode: SeasonCodeValue;
  purchaseMonth: number | null;
  memo: string;
  reminderAt: string | null;
};

type Props = {
  onCreate: (payload: CreatePayload) => Promise<void>;
  onNotify: (message: string, tone?: "info" | "success" | "error") => void;
};

const emptyFields: DetailFields = { brand: "", name: "", size: "", price: "", memo: "" };

export default function RegisterScreen({ onCreate, onNotify }: Props) {
  const [type, setType] = useState<ItemType>("purchased");
  const [imagePath, setImagePath] = useState("");
  const [url, setUrl] = useState("");
  const [fields, setFields] = useState<DetailFields>(emptyFields);
  const [seasonYear, setSeasonYear] = useState(2026);
  const [seasonCode, setSeasonCode] = useState<SeasonCodeValue>("SS");
  const [purchaseMonth, setPurchaseMonth] = useState(new Date().getMonth() + 1);
  const [reminderAt, setReminderAt] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function applyImageFile(file: Blob) {
    setUploading(true);
    try {
      setImagePath(await uploadImageFile(file));
      onNotify("画像を取り込みました。", "success");
    } catch {
      onNotify("画像の取り込みに失敗しました。", "error");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const file = imageFileFromClipboard(event);
      if (!file) return;
      event.preventDefault();
      applyImageFile(file);
    }

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) applyImageFile(file);
    event.target.value = "";
  }

  function updateField(key: keyof DetailFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function fetchFromUrl() {
    if (!url.trim()) {
      onNotify("先にURLを貼り付けてください。");
      return;
    }

    setFetchingUrl(true);
    try {
      const response = await fetch(`/api/og?url=${encodeURIComponent(url.trim())}`);
      if (!response.ok) throw new Error();
      const data = (await response.json()) as { title: string | null; siteName: string | null; imagePath: string | null };

      setFields((current) => ({
        ...current,
        brand: current.brand || data.siteName || "",
        name: current.name || data.title || "",
      }));
      if (!imagePath && data.imagePath) setImagePath(data.imagePath);
      if (data.title || data.siteName) setDetailsOpen(true);
      onNotify(data.title || data.imagePath ? "商品情報を取り込みました。" : "情報を見つけられませんでした。", data.title || data.imagePath ? "success" : "info");
    } catch {
      onNotify("URLから情報を取得できませんでした。", "error");
    } finally {
      setFetchingUrl(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onCreate({
        type,
        imagePath: imagePath || sampleImages[0],
        url: url.trim(),
        brand: fields.brand,
        name: fields.name,
        size: fields.size,
        price: type === "purchased" ? fields.price : null,
        seasonYear,
        seasonCode,
        purchaseMonth: type === "purchased" ? purchaseMonth : null,
        memo: fields.memo,
        reminderAt: type === "want" && reminderAt ? new Date(reminderAt).toISOString() : null,
      });
      setImagePath("");
      setUrl("");
      setFields(emptyFields);
      setReminderAt("");
      setDetailsOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="screen" key="register">
      <header className="screen-header">
        <p>New Entry</p>
        <h1>登録</h1>
        <small>画像だけでもOK。スクショの貼り付け、URLからの自動入力も使えます。</small>
      </header>

      <form className="entry-card" onSubmit={handleSubmit}>
        <div className="segmented" data-selected={type}>
          <span aria-hidden="true" className="segmented-thumb" />
          <button className={type === "purchased" ? "selected" : ""} type="button" onClick={() => setType("purchased")}>
            買った
          </button>
          <button className={type === "want" ? "selected" : ""} type="button" onClick={() => setType("want")}>
            買う
          </button>
        </div>

        <input accept="image/*" hidden onChange={handleFileChange} ref={fileInput} type="file" />
        <button
          className={imagePath ? "dropzone has-image" : "dropzone"}
          onClick={() => fileInput.current?.click()}
          style={imagePath ? { backgroundImage: `url(${imagePath})` } : undefined}
          type="button"
        >
          {uploading ? (
            <span className="dropzone-status">取り込み中...</span>
          ) : imagePath ? (
            <span className="dropzone-change">写真を変更</span>
          ) : (
            <span className="dropzone-placeholder">
              <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M4.5 8.2A2.2 2.2 0 0 1 6.7 6h1.2l1.3-1.8h5.6L16.1 6h1.2a2.2 2.2 0 0 1 2.2 2.2v8.1a2.2 2.2 0 0 1-2.2 2.2H6.7a2.2 2.2 0 0 1-2.2-2.2Z" />
                <circle cx="12" cy="12.4" r="3.4" />
              </svg>
              <strong>タップして写真を選ぶ</strong>
              <small>スクショをコピーして、そのまま貼り付けてもOK</small>
            </span>
          )}
        </button>

        <div className="url-row">
          <input
            placeholder="https://... 商品ページのURL"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <button className="url-fetch" disabled={fetchingUrl} onClick={fetchFromUrl} type="button">
            {fetchingUrl ? "取得中..." : "自動入力"}
          </button>
        </div>

        <div className="quick-row">
          <label>
            <span>シーズン</span>
            <div className="season-picker">
              <select value={seasonYear} onChange={(event) => setSeasonYear(Number(event.target.value))}>
                {yearOptions.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
              <select value={seasonCode} onChange={(event) => setSeasonCode(event.target.value as SeasonCodeValue)}>
                <option>SS</option>
                <option>AW</option>
              </select>
            </div>
          </label>
          {type === "purchased" ? (
            <label>
              <span>購入月</span>
              <select value={purchaseMonth} onChange={(event) => setPurchaseMonth(Number(event.target.value))}>
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              <span>購入予定日時</span>
              <input type="datetime-local" value={reminderAt} onChange={(event) => setReminderAt(event.target.value)} />
            </label>
          )}
        </div>

        <button
          aria-expanded={detailsOpen}
          className="details-toggle"
          onClick={() => setDetailsOpen((current) => !current)}
          type="button"
        >
          詳しく書く
          <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {detailsOpen && (
          <RegisterDetails
            fields={fields}
            imagePath={imagePath}
            onFieldChange={updateField}
            onSelectSample={setImagePath}
            type={type}
          />
        )}

        <button className="primary-button" disabled={saving || uploading} type="submit">
          {saving ? "記録中..." : "記録する"}
        </button>
      </form>
    </section>
  );
}
