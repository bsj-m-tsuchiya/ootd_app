export type ItemType = "purchased" | "want";
export type SeasonCodeValue = "SS" | "AW";
export type Screen = "register" | "want" | "summary";
export type SummaryFrame = "season" | "best";
export type ExportTextMode = "withText" | "noText";
export type ExportSizeKey = "instagram-square" | "instagram-portrait" | "x-landscape";

export type Item = {
  id: string;
  type: ItemType;
  imagePath: string | null;
  url: string | null;
  brand: string | null;
  name: string | null;
  size: string | null;
  price: number | null;
  seasonYear: number;
  seasonCode: SeasonCodeValue;
  purchaseMonth: number | null;
  memo: string | null;
  reminderAt: string | null;
  isBest: boolean;
};

export type DetailDraft = {
  imagePath: string;
  url: string;
  brand: string;
  name: string;
  size: string;
  price: string;
  seasonYear: number;
  seasonCode: SeasonCodeValue;
  purchaseMonth: number;
  memo: string;
  reminderAt: string;
};

export type ExportSize = {
  label: string;
  width: number;
  height: number;
};

export const sampleImages = [
  "/assets/item-white-dress.jpg",
  "/assets/item-dot-dress.jpg",
  "/assets/item-pleated-skirt.jpg",
  "/assets/item-black-top.jpg",
  "/assets/item-black-vest.jpg",
  "/assets/item-gray-top.jpg",
  "/assets/purchased-reference.jpg",
];

export const yearOptions = Array.from({ length: 7 }, (_, index) => 2024 + index);

export const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

export const exportSizes: Record<ExportSizeKey, ExportSize> = {
  "instagram-square": { label: "IG 1:1", width: 1080, height: 1080 },
  "instagram-portrait": { label: "IG 4:5", width: 1080, height: 1350 },
  "x-landscape": { label: "X 16:9", width: 1600, height: 900 },
};

export const exportSizeOptions = Object.entries(exportSizes) as [ExportSizeKey, ExportSize][];
