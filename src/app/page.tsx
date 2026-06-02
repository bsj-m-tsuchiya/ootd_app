"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

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
  purchaseMonth: number | null;
  memo: string | null;
  reminderAt: string | null;
};

type DetailDraft = {
  imagePath: string;
  url: string;
  brand: string;
  name: string;
  size: string;
  price: string;
  seasonYear: number;
  seasonCode: "SS" | "AW";
  purchaseMonth: number;
  memo: string;
  reminderAt: string;
};

const sampleImages = [
  "/assets/item-white-dress.jpg",
  "/assets/item-dot-dress.jpg",
  "/assets/item-pleated-skirt.jpg",
  "/assets/item-black-top.jpg",
  "/assets/item-black-vest.jpg",
  "/assets/item-gray-top.jpg",
  "/assets/purchased-reference.jpg",
];

function seasonOf(item: Pick<Item, "seasonYear" | "seasonCode">) {
  return `${item.seasonYear}${item.seasonCode}`;
}

function resolveImagePath(path: string | null) {
  if (!path) return sampleImages[0];
  if (path === "/assets/want-reference.jpg") return "/assets/purchased-reference.jpg";
  return path;
}

function imageOf(item: Pick<Item, "imagePath">) {
  return resolveImagePath(item.imagePath);
}

function displayBrand(item: Pick<Item, "brand">) {
  return item.brand || "画像だけ保存";
}

function displayName(item: Pick<Item, "name">) {
  return item.name || "商品名未入力";
}

function formatReminder(value: string | null) {
  if (!value) return "未設定";
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function formatDropDate(value: string | null) {
  if (!value) return { day: "--", month: "未定", time: "" };
  const date = new Date(value);
  return {
    day: String(date.getDate()),
    month: `${date.getMonth() + 1}月`,
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
}

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function createDetailDraft(item: Item): DetailDraft {
  return {
    imagePath: resolveImagePath(item.imagePath),
    url: item.url || "",
    brand: item.brand || "",
    name: item.name || "",
    size: item.size || "",
    price: item.price ? String(item.price) : "",
    seasonYear: item.seasonYear,
    seasonCode: item.seasonCode,
    purchaseMonth: item.purchaseMonth || new Date().getMonth() + 1,
    memo: item.memo || "",
    reminderAt: toDatetimeLocal(item.reminderAt),
  };
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [screen, setScreen] = useState<"register" | "want" | "summary">("register");
  const [type, setType] = useState<"purchased" | "want">("purchased");
  const [imagePath, setImagePath] = useState(sampleImages[0]);
  const [seasonYear, setSeasonYear] = useState(2026);
  const [seasonCode, setSeasonCode] = useState<"SS" | "AW">("SS");
  const [purchaseMonth, setPurchaseMonth] = useState(new Date().getMonth() + 1);
  const [activeSeason, setActiveSeason] = useState("2026SS");
  const [seasonWheelOpen, setSeasonWheelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [detailEditing, setDetailEditing] = useState(false);
  const [detailDraft, setDetailDraft] = useState<DetailDraft | null>(null);
  const seasonHoldTimer = useRef<number | null>(null);

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
  const sortedWantItems = [...wantItems].sort((a, b) =>
    String(a.reminderAt || "9999").localeCompare(String(b.reminderAt || "9999")),
  );

  function startSeasonHold() {
    if (seasonHoldTimer.current) window.clearTimeout(seasonHoldTimer.current);
    seasonHoldTimer.current = window.setTimeout(() => {
      setSeasonWheelOpen(true);
    }, 420);
  }

  function clearSeasonHold() {
    if (seasonHoldTimer.current) window.clearTimeout(seasonHoldTimer.current);
    seasonHoldTimer.current = null;
  }

  function openSeasonWheel() {
    clearSeasonHold();
    setSeasonWheelOpen(true);
  }

  function openDetail(item: Item) {
    setSelectedItem(item);
    setDetailDraft(createDetailDraft(item));
    setDetailEditing(false);
  }

  function closeDetail() {
    setSelectedItem(null);
    setDetailDraft(null);
    setDetailEditing(false);
  }

  function updateDraft<Key extends keyof DetailDraft>(key: Key, value: DetailDraft[Key]) {
    setDetailDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function saveDetail() {
    if (!selectedItem || !detailDraft) return;

    const payload = {
      imagePath: detailDraft.imagePath,
      url: detailDraft.url,
      brand: detailDraft.brand,
      name: detailDraft.name,
      size: detailDraft.size,
      price: selectedItem.type === "purchased" ? detailDraft.price : null,
      seasonYear: detailDraft.seasonYear,
      seasonCode: detailDraft.seasonCode,
      purchaseMonth: selectedItem.type === "purchased" ? detailDraft.purchaseMonth : null,
      memo: detailDraft.memo,
      reminderAt: selectedItem.type === "want" ? detailDraft.reminderAt || null : null,
    };

    const response = await fetch(`/api/items/${selectedItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const updated = (await response.json()) as Item;
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedItem(updated);
    setDetailDraft(createDetailDraft(updated));
    setDetailEditing(false);
    if (updated.type === "purchased") setActiveSeason(seasonOf(updated));
  }

  async function deleteDetail() {
    if (!selectedItem) return;
    const ok = window.confirm("この記録を削除しますか？");
    if (!ok) return;

    await fetch(`/api/items/${selectedItem.id}`, {
      method: "DELETE",
    });
    setItems((current) => current.filter((item) => item.id !== selectedItem.id));
    closeDetail();
  }

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
      purchaseMonth: type === "purchased" ? purchaseMonth : null,
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
                {type === "purchased" && (
                  <label>
                    <span>購入月</span>
                    <select value={purchaseMonth} onChange={(event) => setPurchaseMonth(Number(event.target.value))}>
                      {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                        <option key={month} value={month}>
                          {month}月
                        </option>
                      ))}
                    </select>
                  </label>
                )}
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
            <div className="drop-list">
              {sortedWantItems.map((item, index) => {
                const dropDate = formatDropDate(item.reminderAt);
                return (
                  <button
                    className={index === 0 ? "drop-card featured" : "drop-card"}
                    key={item.id}
                    onClick={() => openDetail(item)}
                    type="button"
                  >
                    <div className="drop-image" style={{ backgroundImage: `url(${imageOf(item)})` }}>
                      <span className="drop-date">
                        <small>{dropDate.month}</small>
                        <strong>{dropDate.day}</strong>
                        <small>{dropDate.time}</small>
                      </span>
                    </div>
                    <div className="drop-body">
                      <span className="season-tag">{seasonOf(item)}</span>
                      <strong>{displayBrand(item)}</strong>
                      <span>{displayName(item)}</span>
                      <p>{item.memo || "発売前の気分をここに残す。"}</p>
                    </div>
                  </button>
                );
              })}
              {sortedWantItems.length === 0 && (
                <div className="empty-drop">
                  <strong>次に狙う服を登録しましょう</strong>
                  <span>発売日や迷っている理由だけでも残せます。</span>
                </div>
              )}
            </div>
          </section>
        )}

        {screen === "summary" && (
          <section className="summary-screen">
            <header className="summary-head">
              <div className="summary-season-slot">
                {seasonWheelOpen ? (
                  <div className="summary-season-wheel" aria-label="シーズンを選択">
                    {(seasons.length ? seasons : [activeSeason]).map((season) => (
                      <button
                        className={season === activeSeason ? "active" : ""}
                        key={season}
                        onClick={() => {
                          setActiveSeason(season);
                          setSeasonWheelOpen(false);
                        }}
                        type="button"
                      >
                        #{season}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    className="summary-season-title"
                    onClick={openSeasonWheel}
                    onPointerCancel={clearSeasonHold}
                    onPointerDown={startSeasonHold}
                    onPointerLeave={clearSeasonHold}
                    onPointerUp={clearSeasonHold}
                    type="button"
                  >
                    #{activeSeason}
                  </button>
                )}
              </div>
              <p>KIROKU</p>
            </header>
            <div className="summary-grid">
              {summaryItems.map((item) => (
                <button
                  aria-label={`${displayBrand(item)} ${item.name || ""}の詳細を開く`}
                  className="summary-item"
                  key={item.id}
                  onClick={() => openDetail(item)}
                  style={{ backgroundImage: `url(${imageOf(item)})` }}
                  type="button"
                />
              ))}
            </div>
          </section>
        )}

        {selectedItem && (
          <div className="detail-backdrop" onClick={closeDetail}>
            <section className="detail-sheet" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
              <button className="detail-close" onClick={closeDetail} type="button" aria-label="閉じる">
                ×
              </button>
              <div
                className="detail-image"
                style={{ backgroundImage: `url(${detailEditing && detailDraft ? detailDraft.imagePath : imageOf(selectedItem)})` }}
              />
              <div className="detail-body">
                <span className="detail-type">{selectedItem.type === "purchased" ? "買った服" : "買うもの"}</span>
                <h2>{displayBrand(selectedItem)}</h2>
                {detailEditing && detailDraft ? (
                  <div className="detail-edit">
                    <div className="detail-image-choices" aria-label="画像を選択">
                      {sampleImages.map((src) => (
                        <button
                          aria-label="画像を選択"
                          className={src === detailDraft.imagePath ? "active" : ""}
                          key={src}
                          onClick={() => updateDraft("imagePath", src)}
                          style={{ backgroundImage: `url(${src})` }}
                          type="button"
                        />
                      ))}
                    </div>
                    <label className="wide">
                      <span>URL <em>スキップ可</em></span>
                      <input value={detailDraft.url} onChange={(event) => updateDraft("url", event.target.value)} placeholder="https://..." />
                    </label>
                    <div className="detail-edit-grid">
                      <label>
                        <span>ブランド <em>スキップ可</em></span>
                        <input value={detailDraft.brand} onChange={(event) => updateDraft("brand", event.target.value)} placeholder="Bibiy" />
                      </label>
                      <label>
                        <span>商品名 <em>スキップ可</em></span>
                        <input value={detailDraft.name} onChange={(event) => updateDraft("name", event.target.value)} placeholder="lace hoodie" />
                      </label>
                      <label>
                        <span>サイズ <em>空欄でOK</em></span>
                        <input value={detailDraft.size} onChange={(event) => updateDraft("size", event.target.value)} placeholder="わかる時だけ" />
                      </label>
                      {selectedItem.type === "purchased" && (
                        <label>
                          <span>値段 <em>スキップ可</em></span>
                          <input
                            inputMode="numeric"
                            value={detailDraft.price}
                            onChange={(event) => updateDraft("price", event.target.value)}
                            placeholder="17800"
                          />
                        </label>
                      )}
                      <label>
                        <span>シーズン</span>
                        <div className="season-picker">
                          <select
                            value={detailDraft.seasonYear}
                            onChange={(event) => updateDraft("seasonYear", Number(event.target.value))}
                          >
                            {[2024, 2025, 2026, 2027].map((year) => (
                              <option key={year}>{year}</option>
                            ))}
                          </select>
                          <select
                            value={detailDraft.seasonCode}
                            onChange={(event) => updateDraft("seasonCode", event.target.value as "SS" | "AW")}
                          >
                            <option>SS</option>
                            <option>AW</option>
                          </select>
                        </div>
                      </label>
                      {selectedItem.type === "purchased" && (
                        <label>
                          <span>購入月</span>
                          <select
                            value={detailDraft.purchaseMonth}
                            onChange={(event) => updateDraft("purchaseMonth", Number(event.target.value))}
                          >
                            {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                              <option key={month} value={month}>
                                {month}月
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {selectedItem.type === "want" && (
                        <label className="wide">
                          <span>購入予定日時</span>
                          <input
                            type="datetime-local"
                            value={detailDraft.reminderAt}
                            onChange={(event) => updateDraft("reminderAt", event.target.value)}
                          />
                        </label>
                      )}
                    </div>
                    <label className="wide">
                      <span>メモ</span>
                      <textarea
                        value={detailDraft.memo}
                        onChange={(event) => updateDraft("memo", event.target.value)}
                        placeholder="発売日、迷っている理由、着たい予定など"
                        rows={4}
                      />
                    </label>
                    <div className="detail-actions">
                      <button className="detail-secondary" onClick={() => setDetailEditing(false)} type="button">
                        キャンセル
                      </button>
                      <button className="detail-save" onClick={saveDetail} type="button">
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedItem.url ? (
                      <button
                        className={selectedItem.type === "want" ? "detail-link primary-link" : "detail-link"}
                        onClick={() => window.open(selectedItem.url || "", "_blank", "noopener,noreferrer")}
                        type="button"
                      >
                        {selectedItem.type === "want" ? "購入リンクを開く" : "リンクを開く"}
                      </button>
                    ) : null}
                    <dl className="detail-meta">
                      <dt>商品名</dt>
                      <dd>{selectedItem.name || "未入力"}</dd>
                      <dt>サイズ</dt>
                      <dd>{selectedItem.size || "未入力"}</dd>
                      {selectedItem.price ? (
                        <>
                          <dt>値段</dt>
                          <dd>¥{selectedItem.price.toLocaleString("ja-JP")}</dd>
                        </>
                      ) : null}
                      <dt>シーズン</dt>
                      <dd>{seasonOf(selectedItem)}</dd>
                      {selectedItem.type === "purchased" && selectedItem.purchaseMonth ? (
                        <>
                          <dt>購入月</dt>
                          <dd>{selectedItem.purchaseMonth}月</dd>
                        </>
                      ) : null}
                      {selectedItem.type === "want" ? (
                        <>
                          <dt>予定</dt>
                          <dd>{formatReminder(selectedItem.reminderAt)}</dd>
                        </>
                      ) : null}
                    </dl>
                    <p>{selectedItem.memo || "まだメモはありません。"}</p>
                    <div className="detail-actions">
                      <button className="detail-secondary" onClick={() => setDetailEditing(true)} type="button">
                        編集
                      </button>
                      <button className="detail-danger" onClick={deleteDetail} type="button">
                        削除
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
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
