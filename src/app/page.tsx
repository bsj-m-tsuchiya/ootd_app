"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BottomNav from "@/src/components/BottomNav";
import DetailSheet from "@/src/components/DetailSheet";
import ExportModal from "@/src/components/ExportModal";
import RegisterScreen, { CreatePayload } from "@/src/components/RegisterScreen";
import SummaryScreen from "@/src/components/SummaryScreen";
import ToastStack, { ToastMessage } from "@/src/components/Toast";
import WantScreen from "@/src/components/WantScreen";
import { createDetailDraft, googleCalendarUrl, seasonOf } from "@/src/lib/format";
import { loadHandle } from "@/src/lib/storage";
import {
  DetailDraft,
  ExportSizeKey,
  ExportTextMode,
  Item,
  Screen,
  SummaryFrame,
} from "@/src/lib/types";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [screen, setScreen] = useState<Screen>("register");
  const [activeSeason, setActiveSeason] = useState("2026SS");
  const [seasonWheelOpen, setSeasonWheelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [detailEditing, setDetailEditing] = useState(false);
  const [detailDraft, setDetailDraft] = useState<DetailDraft | null>(null);
  const [summaryFrame, setSummaryFrame] = useState<SummaryFrame>("season");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportTextMode, setExportTextMode] = useState<ExportTextMode>("withText");
  const [exportSizeKey, setExportSizeKey] = useState<ExportSizeKey>("instagram-portrait");
  const [handle, setHandle] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: ToastMessage["tone"] = "info", action?: { label: string; onAction: () => void }) => {
      const id = (toastId.current += 1);
      const wrappedAction = action
        ? {
            label: action.label,
            onAction: () => {
              dismissToast(id);
              action.onAction();
            },
          }
        : undefined;
      setToasts((current) => [...current, { id, message, tone, action: wrappedAction }]);
      window.setTimeout(() => dismissToast(id), action ? 6000 : 3200);
    },
    [dismissToast],
  );

  useEffect(() => {
    setHandle(loadHandle());

    let cancelled = false;
    fetch("/api/items")
      .then(async (response) => {
        const data = (await response.json()) as Item[];
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) notify("記録の読み込みに失敗しました。", "error");
      });

    return () => {
      cancelled = true;
    };
  }, [notify]);

  const purchasedItems = useMemo(() => items.filter((item) => item.type === "purchased"), [items]);
  const wantItems = useMemo(() => items.filter((item) => item.type === "want"), [items]);
  const seasonItems = purchasedItems.filter((item) => seasonOf(item) === activeSeason);
  const summaryItems = summaryFrame === "best" ? seasonItems.filter((item) => item.isBest) : seasonItems;
  const seasons = [...new Set(purchasedItems.map(seasonOf))].sort((a, b) => b.localeCompare(a));
  const sortedWantItems = [...wantItems].sort((a, b) =>
    String(a.reminderAt || "9999").localeCompare(String(b.reminderAt || "9999")),
  );

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

  function openGoogleCalendar(item: Item) {
    const url = googleCalendarUrl(item);
    if (!url) {
      notify("購入予定日時を設定するとGoogleカレンダーに追加できます。");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function applyUpdated(updated: Item) {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedItem((current) => (current?.id === updated.id ? updated : current));
  }

  async function patchItem(id: string, payload: Record<string, unknown>) {
    const response = await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("patch failed");
    return (await response.json()) as Item;
  }

  async function createItem(payload: CreatePayload) {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      notify("記録に失敗しました。", "error");
      return;
    }

    const created = (await response.json()) as Item;
    setItems((current) => [created, ...current]);
    if (created.type === "purchased") {
      setActiveSeason(seasonOf(created));
      setSummaryFrame("season");
      setScreen("summary");
      notify("購入品まとめに追加しました。", "success");
    } else {
      setScreen("want");
      notify("買うものリストに追加しました。", "success");
    }
  }

  async function saveDetail() {
    if (!selectedItem || !detailDraft) return;

    try {
      const updated = await patchItem(selectedItem.id, {
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
        reminderAt:
          selectedItem.type === "want" && detailDraft.reminderAt
            ? new Date(detailDraft.reminderAt).toISOString()
            : null,
      });
      applyUpdated(updated);
      setDetailDraft(createDetailDraft(updated));
      setDetailEditing(false);
      if (updated.type === "purchased") setActiveSeason(seasonOf(updated));
      notify("保存しました。", "success");
    } catch {
      notify("保存に失敗しました。", "error");
    }
  }

  async function toggleBest(item: Item) {
    try {
      const updated = await patchItem(item.id, { isBest: !item.isBest });
      applyUpdated(updated);
      notify(updated.isBest ? "ベストバイに選びました。" : "ベストバイから外しました。", "success");
    } catch {
      notify("変更に失敗しました。", "error");
    }
  }

  async function markPurchased(item: Item) {
    try {
      const updated = await patchItem(item.id, {
        type: "purchased",
        purchaseMonth: new Date().getMonth() + 1,
        reminderAt: null,
      });
      applyUpdated(updated);
      notify("購入品まとめに移しました。", "success", {
        label: "まとめを見る",
        onAction: () => {
          setActiveSeason(seasonOf(updated));
          setSummaryFrame("season");
          setScreen("summary");
        },
      });
    } catch {
      notify("移動に失敗しました。", "error");
    }
  }

  async function restoreItem(item: Item) {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: item.type,
        imagePath: item.imagePath,
        url: item.url || "",
        brand: item.brand || "",
        name: item.name || "",
        size: item.size || "",
        price: item.price,
        seasonYear: item.seasonYear,
        seasonCode: item.seasonCode,
        purchaseMonth: item.purchaseMonth,
        memo: item.memo || "",
        reminderAt: item.reminderAt,
        isBest: item.isBest,
      }),
    });

    if (!response.ok) {
      notify("復元に失敗しました。", "error");
      return;
    }

    const restored = (await response.json()) as Item;
    setItems((current) => [restored, ...current]);
    notify("元に戻しました。", "success");
  }

  async function deleteDetail() {
    if (!selectedItem) return;
    const snapshot = selectedItem;

    await fetch(`/api/items/${snapshot.id}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item.id !== snapshot.id));
    closeDetail();
    notify("削除しました。", "info", {
      label: "元に戻す",
      onAction: () => restoreItem(snapshot),
    });
  }

  return (
    <main className="app-shell">
      <section className="phone">
        <div className="screen-stage" key={screen}>
          {screen === "register" && <RegisterScreen onCreate={createItem} onNotify={notify} />}
          {screen === "want" && (
            <WantScreen
              items={sortedWantItems}
              onMarkPurchased={markPurchased}
              onOpenCalendar={openGoogleCalendar}
              onOpenDetail={openDetail}
            />
          )}
          {screen === "summary" && (
            <SummaryScreen
              activeSeason={activeSeason}
              frame={summaryFrame}
              handle={handle}
              items={summaryItems}
              onFrameToggle={() => setSummaryFrame((current) => (current === "best" ? "season" : "best"))}
              onOpenDetail={openDetail}
              onOpenExport={() => setExportOpen(true)}
              onSelectSeason={setActiveSeason}
              onWheelOpenChange={setSeasonWheelOpen}
              seasons={seasons}
              wheelOpen={seasonWheelOpen}
            />
          )}
        </div>

        {selectedItem && (
          <DetailSheet
            draft={detailDraft}
            editing={detailEditing}
            item={selectedItem}
            onClose={closeDetail}
            onDelete={deleteDetail}
            onEditCancel={() => setDetailEditing(false)}
            onEditStart={() => setDetailEditing(true)}
            onNotify={notify}
            onOpenCalendar={openGoogleCalendar}
            onSave={saveDetail}
            onToggleBest={toggleBest}
            onUpdateDraft={updateDraft}
          />
        )}

        {exportOpen && (
          <ExportModal
            frame={summaryFrame}
            handle={handle}
            items={summaryItems}
            onClose={() => setExportOpen(false)}
            onHandleChange={setHandle}
            onNotify={notify}
            onSizeKeyChange={setExportSizeKey}
            onTextModeChange={setExportTextMode}
            season={activeSeason}
            sizeKey={exportSizeKey}
            textMode={exportTextMode}
          />
        )}

        <BottomNav onChange={setScreen} screen={screen} />
        <ToastStack toasts={toasts} />
      </section>
    </main>
  );
}
