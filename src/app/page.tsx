"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  type: "purchased" | "want";
  imagePath: string | null;
  url: string | null;
  brand: string | null;
  name: string | null;
  size: string | null;
  price: number | null;
  seasonYear: number;
  seasonCode: "SS" | "AW";
  memo: string | null;
  reminderAt: string | null;
};

const sampleImages = [
  "/assets/item-white-dress.jpg",
  "/assets/item-dot-dress.jpg",
  "/assets/item-pleated-skirt.jpg",
  "/assets/item-black-top.jpg",
  "/assets/item-black-vest.jpg",
  "/assets/item-gray-top.jpg",
  "/assets/want-reference.jpg",
];

function seasonOf(item: Pick<Item, "seasonYear" | "seasonCode">) {
  return `${item.seasonYear}${item.seasonCode}`;
}

function formatReminder(value: string | null) {
  if (!value) return "未設定";
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [screen, setScreen] = useState<"register" | "want" | "summary">("register");
  const [type, setType] = useState<"purchased" | "want">("purchased");
  const [imagePath, setImagePath] = useState(sampleImages[0]);
  const [seasonYear, setSeasonYear] = useState(2026);
  const [seasonCode, setSeasonCode] = useState<"SS" | "AW">("SS");
  const [activeSeason, setActiveSeason] = useState("2026SS");

  async function loadItems() {
    const response = await fetch("/api/items");
    setItems(await response.json());
  }

  useEffect(() => {
    loadItems();
  }, []);

  const purchasedItems = useMemo(() => items.filter((item) => item.type === "purchased"), [items]);
  const wantItems = useMemo(() => items.filter((item) => item.type === "want"), [items]);
  const summaryItems = purchasedItems.filter((item) => seasonOf(item) === activeSeason);
  const seasons = [...new Set(purchasedItems.map(seasonOf))].sort((a, b) => b.localeCompare(a));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      type,
      imagePath,
      url: String(form.get("url") || ""),
      brand: String(form.get("brand") || ""),
      name: String(form.get("name") || ""),
      size: String(form.get("size") || ""),
      price: type === "purchased" ? String(form.get("price") || "") : null,
      seasonYear,
      seasonCode,
      memo: String(form.get("memo") || ""),
      reminderAt: type === "want" ? String(form.get("reminderAt") || "") || null : null,
    };

    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const created = (await response.json()) as Item;
    setItems((current) => [created, ...current]);
    if (created.type === "purchased") {
      setActiveSeason(seasonOf(created));
      setScreen("summary");
    } else {
      setScreen("want");
    }
    event.currentTarget.reset();
  }

  return (
    <main className="app-shell">
      <section className="phone">
        {screen === "register" && (
          <section className="screen">
            <header className="screen-header">
              <p>Kiroku</p>
              <h1>登録</h1>
            </header>

            <form className="entry-card" onSubmit={handleSubmit}>
              <div className="segmented">
                <button className={type === "purchased" ? "selected" : ""} type="button" onClick={() => setType("purchased")}>
                  買った
                </button>
                <button className={type === "want" ? "selected" : ""} type="button" onClick={() => setType("want")}>
                  買う
                </button>
              </div>

              <div className="image-picker">
                <span className="image-preview" style={{ backgroundImage: `url(${imagePath})` }} />
                <div>
                  <strong>商品画像</strong>
                  <small>今はサンプル画像から選択。あとでアップロード対応にします。</small>
                </div>
              </div>

              <div className="image-choices">
                {sampleImages.map((src) => (
                  <button
                    aria-label="画像を選択"
                    className={src === imagePath ? "active" : ""}
                    key={src}
                    onClick={() => setImagePath(src)}
                    style={{ backgroundImage: `url(${src})` }}
                    type="button"
                  />
                ))}
              </div>

              <div className="field-grid">
                <label>
                  <span>URL <em>スキップ可</em></span>
                  <input name="url" placeholder="https://..." />
                </label>
                <label>
                  <span>ブランド <em>スキップ可</em></span>
                  <input name="brand" placeholder="Bibiy" />
                </label>
                <label>
                  <span>商品名 <em>スキップ可</em></span>
                  <input name="name" placeholder="lace hoodie" />
                </label>
                <label>
                  <span>サイズ <em>空欄でOK</em></span>
                  <input name="size" placeholder="わかる時だけ" />
                </label>
                {type === "purchased" && (
                  <label>
                    <span>値段 <em>スキップ可</em></span>
                    <input inputMode="numeric" name="price" placeholder="17800" />
                  </label>
                )}
                <label>
                  <span>シーズン</span>
                  <div className="season-picker">
                    <select value={seasonYear} onChange={(event) => setSeasonYear(Number(event.target.value))}>
                      {[2024, 2025, 2026, 2027].map((year) => (
                        <option key={year}>{year}</option>
                      ))}
                    </select>
                    <select value={seasonCode} onChange={(event) => setSeasonCode(event.target.value as "SS" | "AW")}>
                      <option>SS</option>
                      <option>AW</option>
                    </select>
                  </div>
                </label>
                {type === "want" && (
                  <label className="wide">
                    <span>購入予定日時</span>
                    <input name="reminderAt" type="datetime-local" />
                  </label>
                )}
                <label className="wide">
                  <span>メモ</span>
                  <textarea name="memo" placeholder="発売日、迷っている理由、着たい予定など" rows={3} />
                </label>
              </div>

              <button className="primary-button" type="submit">記録する</button>
            </form>
          </section>
        )}

        {screen === "want" && (
          <section className="screen">
            <header className="screen-header">
              <p>Release Alert</p>
              <h1>買うもの</h1>
            </header>
            <div className="want-list">
              {wantItems.map((item) => (
                <article className="want-card" key={item.id}>
                  <div className="want-media" style={{ backgroundImage: `url(${item.imagePath})` }} />
                  <div className="want-body">
                    <span className="season-tag">{seasonOf(item)}</span>
                    <strong>{item.brand || "画像だけ保存"}</strong>
                    <span>{item.name || "商品名未入力"}</span>
                    <b>{formatReminder(item.reminderAt)}</b>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {screen === "summary" && (
          <section className="summary-screen">
            <header className="summary-head">
              <select value={activeSeason} onChange={(event) => setActiveSeason(event.target.value)}>
                {(seasons.length ? seasons : ["2026SS"]).map((season) => (
                  <option key={season}>{season}</option>
                ))}
              </select>
              <h1>#{activeSeason}</h1>
              <p>KIROKU</p>
            </header>
            <div className="summary-grid">
              {summaryItems.map((item) => (
                <button className="summary-item" key={item.id} style={{ backgroundImage: `url(${item.imagePath})` }} />
              ))}
            </div>
          </section>
        )}

        <nav className="bottom-nav">
          <button className={screen === "register" ? "active" : ""} onClick={() => setScreen("register")}>登録</button>
          <button className={screen === "want" ? "active" : ""} onClick={() => setScreen("want")}>買う</button>
          <button className={screen === "summary" ? "active" : ""} onClick={() => setScreen("summary")}>まとめ</button>
        </nav>
      </section>
    </main>
  );
}
