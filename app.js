const imageMap = {
  whiteDress: "assets/item-white-dress.jpg",
  dotDress: "assets/item-dot-dress.jpg",
  pleatedSkirt: "assets/item-pleated-skirt.jpg",
  blackTop: "assets/item-black-top.jpg",
  blackVest: "assets/item-black-vest.jpg",
  grayTop: "assets/item-gray-top.jpg",
  wantHoodie: "assets/want-reference.jpg",
};

const typeLabels = {
  purchased: "買った服",
  want: "買うもの",
};

const seasonLabels = {
  "2026SS": "SNIDEL",
  "2025AW": "ARCHIVE",
};

let summaryAccount = "@kiroku_girl";

const exportSize = {
  width: 1200,
  height: 1600,
};

let activeEntryType = "purchased";
let activeSummarySeason = "2026SS";
let selectedImage = "";
let summaryNavTimer = 0;
let currentExportDataUrl = "";
let shareNudgeTimer = 0;
let hasShownSummaryNudge = false;

const items = [
  {
    id: "p1",
    type: "purchased",
    brand: "SNIDEL",
    name: "white frill mini dress",
    size: "0",
    price: "¥18,700",
    season: "2026SS",
    memo: "白ワンピ枠。写真映えするので今季まとめの主役にする。",
    url: "https://example.com",
    image: imageMap.whiteDress,
  },
  {
    id: "p2",
    type: "purchased",
    brand: "SNIDEL",
    name: "dot collar dress",
    size: "F",
    price: "¥16,500",
    season: "2026SS",
    memo: "小さめドット。似た服を買いすぎないように記録。",
    url: "https://example.com",
    image: imageMap.dotDress,
  },
  {
    id: "p3",
    type: "purchased",
    brand: "THOM BROWNE",
    name: "pleated mini skirt",
    size: "36",
    price: "¥42,000",
    season: "2026SS",
    memo: "SNSの購入品まとめで下段に置きたい。",
    url: "https://example.com",
    image: imageMap.pleatedSkirt,
  },
  {
    id: "p4",
    type: "purchased",
    brand: "Bibiy",
    name: "lace collar knit",
    size: "F",
    price: "¥13,200",
    season: "2026SS",
    memo: "黒トップス枠。甘さがあるから残す寄り。",
    url: "https://example.com",
    image: imageMap.blackTop,
  },
  {
    id: "p5",
    type: "purchased",
    brand: "Courreges",
    name: "button vest set",
    size: "S",
    price: "¥29,800",
    season: "2026SS",
    memo: "セットアップで着る予定。",
    url: "https://example.com",
    image: imageMap.blackVest,
  },
  {
    id: "p6",
    type: "purchased",
    brand: "Sculptor",
    name: "layered gray top",
    size: "M",
    price: "¥12,400",
    season: "2026SS",
    memo: "グレーの気分を残す用。",
    url: "https://example.com",
    image: imageMap.grayTop,
  },
  {
    id: "p7",
    type: "purchased",
    brand: "LILY BROWN",
    name: "classic pleated skirt",
    size: "0",
    price: "¥15,900",
    season: "2025AW",
    memo: "秋冬の購入品まとめ用。今季との違いが見返せる。",
    url: "https://example.com",
    image: imageMap.pleatedSkirt,
  },
  {
    id: "p8",
    type: "purchased",
    brand: "Bibiy",
    name: "black tailored vest",
    size: "F",
    price: "¥19,800",
    season: "2025AW",
    memo: "黒ベスト枠。次に似た服を買う前の比較用。",
    url: "https://example.com",
    image: imageMap.blackVest,
  },
  {
    id: "p9",
    type: "purchased",
    brand: "Sculptor",
    name: "soft gray layered top",
    size: "M",
    price: "¥11,600",
    season: "2025AW",
    memo: "寒い時期の薄手トップス。前の季節との比較用。",
    url: "https://example.com",
    image: imageMap.grayTop,
  },
  {
    id: "p10",
    type: "purchased",
    brand: "SNIDEL",
    name: "lace collar knit",
    size: "F",
    price: "¥13,800",
    season: "2025AW",
    memo: "甘め黒トップスの前回枠。",
    url: "https://example.com",
    image: imageMap.blackTop,
  },
  {
    id: "w1",
    type: "want",
    brand: "Girl Lele Studio",
    name: "lace hood top",
    size: "F",
    season: "2026SS",
    reminder: "2026-06-17T18:00",
    memo: "発売時間に公式サイトを見る。白系トップスとかぶるかだけ確認。",
    url: "https://example.com",
    image: imageMap.wantHoodie,
  },
  {
    id: "w2",
    type: "want",
    brand: "Bibiy",
    name: "ribbon knit",
    size: "F",
    season: "2026SS",
    reminder: "2026-06-02T18:00",
    memo: "発売日に買う。リンクを忘れない。",
    url: "https://example.com",
    image: imageMap.dotDress,
  },
];

const screens = document.querySelectorAll(".screen");
const phone = document.querySelector(".phone");
const navButtons = document.querySelectorAll("[data-nav]");
const jumpButtons = document.querySelectorAll("[data-jump]");
const entryTypeButtons = document.querySelectorAll("[data-entry-type]");
const entryForm = document.querySelector("#entryForm");
const formNote = document.querySelector("#formNote");
const imageInput = document.querySelector("#imageInput");
const imagePreview = document.querySelector("#imagePreview");
const priceField = document.querySelector(".price-field");
const snsField = document.querySelector("#snsField");
const snsFieldWrap = document.querySelector(".sns-field");
const reminderField = document.querySelector(".reminder-field");
const wantList = document.querySelector("#wantList");
const wantCalendar = document.querySelector("#wantCalendar");
const summaryCarousel = document.querySelector("#summaryCarousel");
const summaryExportButton = document.querySelector("#summaryExportButton");
const seasonWheel = document.querySelector("#seasonWheel");
const seasonWheelClose = document.querySelector("#seasonWheelClose");
const seasonWheelOptions = document.querySelector("#seasonWheelOptions");
const detailSheet = document.querySelector("#detailSheet");
const sheetImage = document.querySelector("#sheetImage");
const sheetType = document.querySelector("#sheetType");
const sheetTitle = document.querySelector("#sheetTitle");
const sheetMeta = document.querySelector("#sheetMeta");
const sheetMemo = document.querySelector("#sheetMemo");
const sheetReminderWrap = document.querySelector("#sheetReminderWrap");
const sheetReminder = document.querySelector("#sheetReminder");
const saveReminderButton = document.querySelector("#saveReminderButton");
const openLinkButton = document.querySelector("#openLinkButton");
const editDetailButton = document.querySelector("#editDetailButton");
const detailEditPanel = document.querySelector("#detailEditPanel");
const cancelEditButton = document.querySelector("#cancelEditButton");
const editUrlField = document.querySelector("#editUrlField");
const editBrandField = document.querySelector("#editBrandField");
const editNameField = document.querySelector("#editNameField");
const editSizeField = document.querySelector("#editSizeField");
const editPriceWrap = document.querySelector("#editPriceWrap");
const editPriceField = document.querySelector("#editPriceField");
const editSeasonField = document.querySelector("#editSeasonField");
const editMemoField = document.querySelector("#editMemoField");
const exportSheet = document.querySelector("#exportSheet");
const exportPreview = document.querySelector("#exportPreview");
const closeExportButton = document.querySelector("#closeExportButton");
const saveExportButton = document.querySelector("#saveExportButton");
const shareNudgeText = document.querySelector("#shareNudgeText");
const nudgeExportButton = document.querySelector("#nudgeExportButton");
const summaryNavHandle = document.querySelector("#summaryNavHandle");

let activeDetailId = null;
let seasonTitleHoldTimer = 0;

summaryExportButton.hidden = true;

function setScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === name);
  });

  phone.classList.toggle("summary-clean", name === "summary");
  summaryExportButton.hidden = name !== "summary";
  phone.classList.remove("summary-nav-visible");
  phone.classList.remove("show-share-nudge");
  window.clearTimeout(summaryNavTimer);
  window.clearTimeout(shareNudgeTimer);

  if (name === "summary") {
    if (!hasShownSummaryNudge) {
      hasShownSummaryNudge = true;
      shareNudgeTimer = window.setTimeout(() => {
        showShareNudge("右上の保存ボタンで投稿用画像を作れます", 4200);
      }, 900);
    }
  }
}

function formatReminder(value) {
  if (!value) return "未設定";
  const date = new Date(value);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hour}:${minute}`;
}

function formatScheduleDay(value) {
  if (!value) return { month: "-", day: "-", time: "未定" };
  const date = new Date(value);
  return {
    month: `${date.getMonth() + 1}月`,
    day: String(date.getDate()),
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
}

function formatPrice(value) {
  const numeric = Number(String(value).replace(/[^\d]/g, ""));
  if (!numeric) return value || "";
  return `¥${numeric.toLocaleString("ja-JP")}`;
}

function displayBrand(item) {
  return item.brand || "画像だけ保存";
}

function displayName(item) {
  return item.name || "商品名未入力";
}

function setFormNote(message, isError = false) {
  formNote.textContent = message;
  formNote.classList.toggle("error", isError);
}

function hasEntryContent(fields) {
  return Boolean(
    selectedImage ||
      fields.url ||
      fields.brand ||
      fields.name ||
      fields.size ||
      fields.price ||
      fields.reminder ||
      fields.memo,
  );
}

function getSummarySeasons() {
  const seasons = items
    .filter((item) => item.type === "purchased")
    .map((item) => item.season);

  return [...new Set(seasons)].sort((a, b) => b.localeCompare(a));
}

function getSeasonLabel(seasonItems, season) {
  if (seasonLabels[season]) return seasonLabels[season];
  return seasonItems.find((item) => item.brand)?.brand || "KIROKU";
}

function normalizeAccount(value) {
  const account = value.trim();
  if (!account) return summaryAccount;
  return account.startsWith("@") ? account : `@${account}`;
}

function updateEntryFields() {
  const isWant = activeEntryType === "want";
  const needsReminder = activeEntryType !== "purchased";

  priceField.style.display = isWant ? "none" : "grid";
  snsFieldWrap.style.display = isWant ? "none" : "grid";
  reminderField.style.display = needsReminder ? "grid" : "none";

  entryTypeButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.entryType === activeEntryType);
  });
}

function renderWantList() {
  wantList.innerHTML = "";
  items
    .filter((item) => item.type === "want")
    .sort((a, b) => String(a.reminder || "9999").localeCompare(String(b.reminder || "9999")))
    .forEach((item, index) => {
      const schedule = formatScheduleDay(item.reminder);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "want-card";
      card.innerHTML = `
        <span class="want-media" style="background-image: url('${item.image}')">
          ${index === 0 ? `<span class="time-strip">${formatReminder(item.reminder)}-</span>` : ""}
        </span>
        <span class="want-body">
          <span class="want-schedule">
            <span class="season-tag">${item.season}</span>
            <span class="schedule-date">
              <span>${schedule.month}</span>
              <strong>${schedule.day}</strong>
              <span>${schedule.time}</span>
            </span>
          </span>
          <h3>${displayBrand(item)}</h3>
          <p>${displayName(item)}</p>
        </span>
      `;
      card.addEventListener("click", () => openDetail(item.id));
      wantList.append(card);
    });
}

function renderWantCalendar() {
  const scheduledItems = items
    .filter((item) => item.type === "want")
    .sort((a, b) => String(a.reminder || "9999").localeCompare(String(b.reminder || "9999")));

  if (!scheduledItems.length) {
    wantCalendar.innerHTML = "";
    return;
  }

  const nextItem = scheduledItems[0];
  const nextSchedule = formatScheduleDay(nextItem.reminder);
  wantCalendar.innerHTML = `
    <div class="calendar-head">
      <span>Release</span>
      <small>${scheduledItems.length} alerts</small>
    </div>
    <button class="calendar-feature" type="button" data-item-id="${nextItem.id}">
      <span class="calendar-feature-copy">
        <small>next drop</small>
        <strong>${nextSchedule.month}${nextSchedule.day}日</strong>
        <em>${nextSchedule.time}</em>
        <span>${displayBrand(nextItem)}</span>
      </span>
      <span class="calendar-feature-image" style="background-image: url('${nextItem.image}')"></span>
    </button>
    <div class="calendar-rail"></div>
  `;

  wantCalendar.querySelector(".calendar-feature").addEventListener("click", () => openDetail(nextItem.id));

  const rail = wantCalendar.querySelector(".calendar-rail");
  scheduledItems.forEach((item) => {
    const schedule = formatScheduleDay(item.reminder);
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "calendar-tile";
    tile.innerHTML = `
      <span class="calendar-thumb" style="background-image: url('${item.image}')"></span>
      <span class="calendar-date-mark">
        <small>${schedule.month}</small>
        <strong>${schedule.day}</strong>
      </span>
      <span class="calendar-item-copy">
        <strong>${displayBrand(item)}</strong>
        <small>${schedule.time}</small>
      </span>
    `;
    tile.addEventListener("click", () => openDetail(item.id));
    rail.append(tile);
  });
}

function renderSummary() {
  const seasons = getSummarySeasons();
  summaryCarousel.innerHTML = "";
  if (!seasons.includes(activeSummarySeason)) activeSummarySeason = seasons[0] || "2026SS";

  const seasonItems = items.filter(
    (item) => item.type === "purchased" && item.season === activeSummarySeason,
  );
  const board = document.createElement("article");
  board.className = "share-board";
  board.dataset.season = activeSummarySeason;
  board.setAttribute("aria-label", `${activeSummarySeason} 購入品まとめ`);
  board.innerHTML = `
    <header class="summary-head">
      <button class="summary-season-title" type="button" aria-label="シーズンを選択">#${activeSummarySeason}</button>
      <span>${getSeasonLabel(seasonItems, activeSummarySeason)}</span>
      <small class="summary-account">${summaryAccount}</small>
    </header>
    <div class="summary-grid"></div>
  `;

  const grid = board.querySelector(".summary-grid");
  seasonItems.forEach((item) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "summary-item";
    card.style.backgroundImage = `url('${item.image}')`;
    card.setAttribute("aria-label", `${displayBrand(item)} ${displayName(item)}`);
    card.addEventListener("click", () => openDetail(item.id));
    grid.append(card);
  });

  summaryCarousel.append(board);
  renderSeasonWheelOptions();
}

function renderSeasonWheelOptions() {
  const seasons = getSummarySeasons();
  seasonWheelOptions.innerHTML = seasons
    .map(
      (season) =>
        `<button class="wheel-option ${season === activeSummarySeason ? "active" : ""}" type="button" data-season="${season}">#${season}</button>`,
    )
    .join("");
}

function openSeasonWheel() {
  renderSeasonWheelOptions();
  seasonWheel.classList.add("visible");
  seasonWheel.setAttribute("aria-hidden", "false");
  phone.classList.add("season-wheel-open");
  phone.classList.remove("show-share-nudge");
  window.setTimeout(() => {
    seasonWheelOptions
      .querySelector(".wheel-option.active")
      ?.scrollIntoView({ block: "center", inline: "nearest" });
  }, 0);
}

function closeSeasonWheel() {
  seasonWheel.classList.remove("visible");
  seasonWheel.setAttribute("aria-hidden", "true");
  phone.classList.remove("season-wheel-open");
}

function selectSummarySeason(season) {
  if (!season || season === activeSummarySeason) {
    closeSeasonWheel();
    return;
  }
  activeSummarySeason = season;
  closeSeasonWheel();
  renderSummary();
}

function showSummaryNavTemporarily() {
  if (!phone.classList.contains("summary-clean")) return;
  phone.classList.add("summary-nav-visible");
  window.clearTimeout(summaryNavTimer);
  summaryNavTimer = window.setTimeout(() => {
    phone.classList.remove("summary-nav-visible");
  }, 2400);
}

function showShareNudge(message, duration = 4600) {
  if (
    !phone.classList.contains("summary-clean") ||
    exportSheet.open ||
    detailSheet.open ||
    seasonWheel.classList.contains("visible")
  ) {
    return;
  }
  shareNudgeText.textContent = message;
  phone.classList.add("show-share-nudge");
  window.clearTimeout(shareNudgeTimer);
  shareNudgeTimer = window.setTimeout(() => {
    phone.classList.remove("show-share-nudge");
  }, duration);
}

function renderAll() {
  renderWantList();
  renderWantCalendar();
  renderSummary();
}

function setDetailEditMode(isEditing) {
  detailEditPanel.classList.toggle("visible", isEditing);
  editDetailButton.style.display = isEditing ? "none" : "inline-flex";
}

function populateDetailEditFields(item) {
  editUrlField.value = item.url || "";
  editBrandField.value = item.brand || "";
  editNameField.value = item.name || "";
  editSizeField.value = item.size || "";
  editPriceField.value = item.price || "";
  editSeasonField.value = item.season || "2026SS";
  editMemoField.value = item.memo || "";
  sheetReminder.value = item.reminder || "";
  editPriceWrap.style.display = item.type === "want" ? "none" : "grid";
  sheetReminderWrap.style.display = item.type === "want" ? "grid" : "none";
}

function saveDetailEdits() {
  const item = items.find((entry) => entry.id === activeDetailId);
  if (!item) return;

  item.url = editUrlField.value.trim();
  item.brand = editBrandField.value.trim();
  item.name = editNameField.value.trim();
  item.size = editSizeField.value.trim();
  item.price = item.type === "want" ? "" : formatPrice(editPriceField.value.trim());
  item.season = editSeasonField.value.trim() || "2026SS";
  item.memo = editMemoField.value.trim();
  item.reminder = item.type === "want" ? sheetReminder.value : "";

  if (item.type === "purchased") activeSummarySeason = item.season;
  renderAll();
  openDetail(item.id);
  setDetailEditMode(false);
}

function openDetail(id) {
  const item = items.find((entry) => entry.id === id);
  if (!item) return;

  activeDetailId = id;
  sheetImage.style.backgroundImage = `url('${item.image}')`;
  sheetType.textContent = typeLabels[item.type];
  sheetTitle.textContent = displayBrand(item);
  sheetMemo.textContent = item.memo || "まだメモはありません。";
  sheetMeta.innerHTML = `
    <dt>商品名</dt><dd>${displayName(item)}</dd>
    <dt>サイズ</dt><dd>${item.size || "未入力"}</dd>
    ${item.price ? `<dt>値段</dt><dd>${item.price}</dd>` : ""}
    <dt>シーズン</dt><dd>${item.season}</dd>
  `;

  populateDetailEditFields(item);
  setDetailEditMode(false);
  openLinkButton.onclick = () => {
    if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
  };

  if (!detailSheet.open && typeof detailSheet.showModal === "function") {
    detailSheet.showModal();
  } else if (!detailSheet.open) {
    detailSheet.setAttribute("open", "");
  }
}

function buildItemFromForm() {
  const accountValue = snsField.value.trim();
  if (activeEntryType === "purchased" && accountValue) {
    summaryAccount = normalizeAccount(accountValue);
  }

  const fields = {
    url: document.querySelector("#urlField").value.trim(),
    brand: document.querySelector("#brandField").value.trim(),
    name: document.querySelector("#nameField").value.trim(),
    size: document.querySelector("#sizeField").value.trim(),
    price: document.querySelector("#priceField").value.trim(),
    season: document.querySelector("#seasonField").value.trim() || "2026SS",
    reminder: activeEntryType === "purchased" ? "" : document.querySelector("#reminderField").value,
    memo: document.querySelector("#memoField").value.trim(),
  };

  if (!hasEntryContent(fields)) return null;

  const item = {
    id: `${activeEntryType}-${Date.now()}`,
    type: activeEntryType,
    brand: fields.brand,
    name: fields.name,
    size: fields.size,
    price: activeEntryType === "want" ? "" : formatPrice(fields.price),
    season: fields.season,
    reminder: fields.reminder,
    memo: fields.memo,
    url: fields.url,
    image: selectedImage || (activeEntryType === "want" ? imageMap.wantHoodie : imageMap.whiteDress),
  };

  return item;
}

function getExportLayout(count) {
  if (count <= 1) return { cols: 1, rows: 1 };
  if (count <= 2) return { cols: 2, rows: 1 };
  if (count <= 6) return { cols: 2, rows: Math.ceil(count / 2) };
  return { cols: 3, rows: Math.ceil(count / 3) };
}

function loadCanvasImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawFittedImage(context, image, x, y, width, height) {
  const ratio = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * ratio;
  const drawHeight = image.naturalHeight * ratio;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawTrackingText(context, text, x, y, tracking) {
  const characters = [...text];
  const widths = characters.map((character) => context.measureText(character).width);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + tracking * (characters.length - 1);
  let cursor = x - totalWidth / 2;

  characters.forEach((character, index) => {
    context.fillText(character, cursor, y);
    cursor += widths[index] + tracking;
  });
}

function fitTitleFont(context, text) {
  let size = 188;
  do {
    context.font = `${size}px "Times New Roman", serif`;
    size -= 4;
  } while (context.measureText(text).width > exportSize.width - 130 && size > 92);
}

async function createSummaryImage(season) {
  const seasonItems = items.filter((item) => item.type === "purchased" && item.season === season);
  const canvas = document.createElement("canvas");
  canvas.width = exportSize.width;
  canvas.height = exportSize.height;

  const context = canvas.getContext("2d");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const title = `#${season}`;
  context.fillStyle = "#111";
  context.textAlign = "center";
  context.textBaseline = "top";
  fitTitleFont(context, title);
  context.fillText(title, canvas.width / 2, 96);

  context.font = '50px Inter, Arial, sans-serif';
  context.textBaseline = "alphabetic";
  drawTrackingText(context, getSeasonLabel(seasonItems, season), 875, 360, 10);

  context.font = '32px Inter, Arial, sans-serif';
  context.fillStyle = "#7f7873";
  context.textAlign = "right";
  context.fillText(summaryAccount, 1010, 415);

  const layout = getExportLayout(seasonItems.length);
  const area = {
    x: layout.cols === 3 ? 70 : 110,
    y: 455,
    width: layout.cols === 3 ? 1060 : 980,
    height: 1045,
  };
  const gapX = layout.cols === 3 ? 34 : 62;
  const gapY = layout.rows >= 3 ? 18 : 42;
  const cellWidth = (area.width - gapX * (layout.cols - 1)) / layout.cols;
  const cellHeight = (area.height - gapY * (layout.rows - 1)) / layout.rows;

  const images = await Promise.all(seasonItems.map((item) => loadCanvasImage(item.image)));
  images.forEach((image, index) => {
    const col = index % layout.cols;
    const row = Math.floor(index / layout.cols);
    const x = area.x + col * (cellWidth + gapX);
    const y = area.y + row * (cellHeight + gapY);
    drawFittedImage(context, image, x, y, cellWidth, cellHeight);
  });

  return canvas.toDataURL("image/png");
}

async function exportActiveSummaryImage() {
  phone.classList.remove("show-share-nudge");
  currentExportDataUrl = await createSummaryImage(activeSummarySeason);
  exportPreview.src = currentExportDataUrl;

  if (typeof exportSheet.showModal === "function") {
    exportSheet.showModal();
  } else {
    exportSheet.setAttribute("open", "");
  }
}

function saveCurrentExportImage() {
  if (!currentExportDataUrl) return;
  const link = document.createElement("a");
  link.href = currentExportDataUrl;
  link.download = `${activeSummarySeason}-kiroku.png`;
  document.body.append(link);
  link.click();
  link.remove();
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => setScreen(button.dataset.nav));
});

jumpButtons.forEach((button) => {
  button.addEventListener("click", () => setScreen(button.dataset.jump));
});

entryTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeEntryType = button.dataset.entryType;
    updateEntryFields();
    setFormNote("画像だけでも保存できます。空欄はあとで埋める前提で大丈夫。");
  });
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  selectedImage = URL.createObjectURL(file);
  imagePreview.classList.add("has-image");
  imagePreview.style.setProperty("--preview-image", `url('${selectedImage}')`);
});

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const item = buildItemFromForm();
  if (!item) {
    setFormNote("画像、URL、ブランド、商品名、メモなど、どれか1つだけ入れれば保存できます。", true);
    return;
  }

  items.unshift(item);
  if (item.type === "purchased") activeSummarySeason = item.season;
  renderAll();
  entryForm.reset();
  document.querySelector("#seasonField").value = "2026SS";
  selectedImage = "";
  imagePreview.classList.remove("has-image");
  setFormNote("画像だけでも保存できます。空欄はあとで埋める前提で大丈夫。");
  setScreen(activeEntryType === "purchased" ? "summary" : activeEntryType);
});

summaryExportButton.addEventListener("click", async () => {
  await exportActiveSummaryImage();
});

summaryCarousel.addEventListener("pointerdown", (event) => {
  if (!(event.target instanceof Element)) return;
  const title = event.target.closest(".summary-season-title");
  if (!title) return;

  window.clearTimeout(seasonTitleHoldTimer);
  title.classList.add("holding");
  seasonTitleHoldTimer = window.setTimeout(() => {
    title.classList.remove("holding");
    openSeasonWheel();
  }, 520);
});

["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
  summaryCarousel.addEventListener(eventName, () => {
    window.clearTimeout(seasonTitleHoldTimer);
    summaryCarousel.querySelector(".summary-season-title")?.classList.remove("holding");
  });
});

seasonWheelOptions.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const option = event.target.closest(".wheel-option");
  if (!option) return;
  selectSummarySeason(option.dataset.season);
});

seasonWheelClose.addEventListener("click", closeSeasonWheel);

nudgeExportButton.addEventListener("click", async () => {
  await exportActiveSummaryImage();
});

summaryNavHandle.addEventListener("click", () => {
  phone.classList.remove("show-share-nudge");
  showSummaryNavTemporarily();
});

editDetailButton.addEventListener("click", () => {
  const item = items.find((entry) => entry.id === activeDetailId);
  if (!item) return;
  populateDetailEditFields(item);
  setDetailEditMode(true);
});

cancelEditButton.addEventListener("click", () => {
  const item = items.find((entry) => entry.id === activeDetailId);
  if (item) populateDetailEditFields(item);
  setDetailEditMode(false);
});

saveReminderButton.addEventListener("click", () => {
  saveDetailEdits();
});

detailSheet.addEventListener("click", (event) => {
  const rect = detailSheet.getBoundingClientRect();
  const clickedOutside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (clickedOutside) detailSheet.close();
});

closeExportButton.addEventListener("click", () => {
  exportSheet.close();
});

saveExportButton.addEventListener("click", saveCurrentExportImage);

exportSheet.addEventListener("click", (event) => {
  const rect = exportSheet.getBoundingClientRect();
  const clickedOutside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (clickedOutside) exportSheet.close();
});

document.addEventListener("keydown", (event) => {
  if (!phone.classList.contains("summary-clean")) return;

  const looksLikeScreenshot =
    event.key === "PrintScreen" ||
    ((event.metaKey || event.ctrlKey) &&
      event.shiftKey &&
      (event.code === "Digit3" ||
        event.code === "Digit4" ||
        event.code === "Digit5" ||
        event.key === "3" ||
        event.key === "4" ||
        event.key === "5"));

  if (looksLikeScreenshot) {
    showShareNudge("スクショよりきれいな投稿画像を作れます", 5200);
  }
});

updateEntryFields();
renderAll();
